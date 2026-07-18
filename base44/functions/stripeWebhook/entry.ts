import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

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
    // === CHECKOUT SESSION COMPLETED ===
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email;
      const subscriptionId = session.subscription;

      console.log(`Checkout completed for email: ${customerEmail}, sub: ${subscriptionId}`);

      if (!customerEmail) {
        console.error('No customer email in session');
        return Response.json({ received: true });
      }

      const users = await base44.asServiceRole.entities.User.filter({ email: customerEmail });
      if (!users || users.length === 0) {
        console.error('No user found for email:', customerEmail);
        return Response.json({ received: true });
      }

      const user = users[0];

      let status = 'active';
      let renewalDate = null;
      let trialEndDate = null;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log(`Subscription status: ${subscription.status}, trial_end: ${subscription.trrial_end}, period_end: ${subscription.current_period_end}`);

        if (subscription.status === 'trialing') {
          status = 'trial';
          if (subscription.trial_end) {
            trialEndDate = new Date(subscription.trial_end * 1000).toISOString().split('T')[0];
          }
        } else if (subscription.status === 'active') {
          status = 'active';
        }
        if (subscription.current_period_end) {
          renewalDate = new Date(subscription.current_period_end * 1000).toISOString();
        }
      }

      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_status: status,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscriptionId,
        renewal_date: renewalDate,
        trial_end_date: trialEndDate,
        grace_period_start: null,
        cancelled_date: null,
      });

      console.log(`Updated user ${user.id} (${user.email}) subscription_status to ${status}, renewal_date to ${renewalDate}`);
    }

    // === INVOICE PAID — catches trial-to-paid transition ===
    if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const subscriptionId = invoice.subscription;

      console.log(`Invoice paid for customer: ${customerId}, sub: ${subscriptionId}`);

      // Only process if this is a subscription invoice (not one-time)
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log(`Subscription status from invoice: ${subscription.status}`);

        // Look up user by stripe_customer_id
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
        if (!users || users.length === 0) {
          console.error('No user found for Stripe customer:', customerId);
          return Response.json({ received: true });
        }

        const user = users[0];
        let newStatus = 'active';
        let updateData = {
          grace_period_start: null,
          cancelled_date: null,
        };

        if (subscription.status === 'trialing') {
          newStatus = 'trial';
          if (subscription.trial_end) {
            updateData.trial_end_date = new Date(subscription.trial_end * 1000).toISOString().split('T')[0];
          }
        }

        updateData.subscription_status = newStatus;
        if (subscription.current_period_end) {
          updateData.renewal_date = new Date(subscription.current_period_end * 1000).toISOString();
        }

        await base44.asServiceRole.entities.User.update(user.id, updateData);
        console.log(`Updated user ${user.id} (${user.email}) via invoice.paid: status=${newStatus}, renewal=${updateData.renewal_date}`);
      }
    }

    // === PAYMENT FAILED ===
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      console.log(`Payment failed for customer: ${customerId}`);

      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
      if (!users || users.length === 0) {
        console.error('No user found for Stripe customer:', customerId);
        return Response.json({ received: true });
      }

      const user = users[0];

      if (user.subscription_status === 'active' || user.subscription_status === 'trial') {
        await base44.asServiceRole.entities.User.update(user.id, {
          subscription_status: 'grace_period',
          grace_period_start: new Date().toISOString(),
        });
        console.log(`User ${user.id} (${user.email}) entered grace period due to payment failure`);
      }
    }

    // === SUBSCRIPTION UPDATED OR DELETED ===
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      console.log(`Subscription ${event.type} for customer: ${customerId}, sub status: ${subscription.status}`);

      const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
      if (!users || users.length === 0) {
        console.error('No user found for Stripe customer:', customerId);
        return Response.json({ received: true });
      }

      const user = users[0];
      let newStatus;
      let updateData = {};

      if (event.type === 'customer.subscription.deleted') {
        newStatus = 'cancelled';
        updateData.cancelled_date = new Date().toISOString().split('T')[0];
      } else {
        const s = subscription.status;
        if (s === 'active') {
          newStatus = 'active';
          updateData.grace_period_start = null;
          updateData.cancelled_date = null;
        } else if (s === 'trialing') {
          newStatus = 'trial';
          updateData.grace_period_start = null;
          if (subscription.trial_end) {
            updateData.trial_end_date = new Date(subscription.trial_end * 1000).toISOString().split('T')[0];
          }
        } else if (s === 'canceled' || s === 'cancelled') {
          newStatus = 'cancelled';
          updateData.cancelled_date = new Date().toISOString().split('T')[0];
        } else if (s === 'past_due' || s === 'unpaid') {
          newStatus = 'grace_period';
          if (!user.grace_period_start) {
            updateData.grace_period_start = new Date().toISOString();
          }
        } else {
          newStatus = 'expired';
        }
      }

      if (subscription.current_period_end) {
        updateData.renewal_date = new Date(subscription.current_period_end * 1000).toISOString();
      }

      updateData.subscription_status = newStatus;

      await base44.asServiceRole.entities.User.update(user.id, updateData);
      console.log(`Updated user ${user.id} (${user.email}) via ${event.type}: status=${newStatus}, renewal=${updateData.renewal_date}`);
    }
  } catch (err) {
    console.error('Error processing webhook:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }

  return Response.json({ received: true });
});