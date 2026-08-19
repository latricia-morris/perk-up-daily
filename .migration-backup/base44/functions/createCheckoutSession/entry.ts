import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.34';

const ALLOWED_DOMAINS = ['perkupdaily.app'];

function safeUrl(input, fallback) {
  if (!input) return fallback;
  try {
    const url = new URL(input);
    if (ALLOWED_DOMAINS.includes(url.hostname)) return url.href;
  } catch {}
  return fallback;
}

const PRICES = {
  monthly: 'price_1TkALtEyzW6vQLlOMrLtrYxy',
  annual: 'price_1TkALtEyzW6vQLlO7DyIQshb',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.email) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { plan, successUrl, cancelUrl } = await req.json();

    if (!plan || !PRICES[plan]) {
      return Response.json({ error: 'Invalid plan. Must be "monthly" or "annual".' }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const sessionConfig = {
      mode: 'subscription',
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      success_url: safeUrl(successUrl, 'https://perkupdaily.app/dashboard'),
      cancel_url: safeUrl(cancelUrl, 'https://perkupdaily.app/paywall'),
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        base44_user_id: user.id,
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