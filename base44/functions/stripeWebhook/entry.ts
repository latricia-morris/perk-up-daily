import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Webhook signature invalid', { status: 400 });
  }

  console.log('Stripe webhook event:', event.type);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      const subscriptionId = session.subscription;

      if (!customerEmail) {
        console.error('No customer email in session');
        return Response.json({ received: true });
      }

      // Find user by email
      const users = await base44.asServiceRole.entities.User.filter({ email: customerEmail });
      if (!users || users.length === 0) {
        console.error('No user found for email:', customerEmail);
        return Response.json({ received: true });
      }

      const user = users[0];

      // Determine status from subscription
      let status = 'active';
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        if (subscription.status === 'trialing') status = 'trial';
        else if (subscription.status === 'active') status = 'active';
      }

      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_status: status,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscriptionId,
      });

      console.log(`Updated user ${user.id} subscription_status to ${status}`);
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Look up user by stripe_customer_id
      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
      if (!users || users.length === 0) {
        console.error('No user found for Stripe customer:', customerId);
        return Response.json({ received: true });
      }

      const user = users[0];
      let newStatus;

      if (event.type === 'customer.subscription.deleted') {
        newStatus = 'cancelled';
      } else {
        const s = subscription.status;
        if (s === 'active') newStatus = 'active';
        else if (s === 'trialing') newStatus = 'trial';
        else if (s === 'canceled' || s === 'cancelled') newStatus = 'cancelled';
        else newStatus = 'expired';
      }

      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_status: newStatus,
      });

      console.log(`Updated user ${user.id} subscription_status to ${newStatus}`);
    }
  } catch (err) {
    console.error('Error processing webhook:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }

  return Response.json({ received: true });
});