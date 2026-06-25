import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.34';

const PRICES = {
  monthly: 'price_1TkALtEyzW6vQLlOMrLtrYxy',
  annual: 'price_1TkALtEyzW6vQLlO7DyIQshb',
};

Deno.serve(async (req) => {
  try {
    const { plan, successUrl, cancelUrl } = await req.json();

    if (!plan || !PRICES[plan]) {
      return Response.json({ error: 'Invalid plan. Must be "monthly" or "annual".' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const sessionConfig = {
      mode: 'subscription',
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      success_url: successUrl || 'https://perkupdaily.app/dashboard',
      cancel_url: cancelUrl || 'https://perkupdaily.app/paywall',
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        plan,
      },
    };

    // 7-day free trial for monthly plan only
    if (plan === 'monthly') {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});