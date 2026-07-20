import Stripe from 'npm:stripe@14';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Fetch all users — paginate to be safe
    let allUsers = [];
    let skip = 0;
    const limit = 100;
    let hasMore = true;
    while (hasMore) {
      const batch = await base44.asServiceRole.entities.User.list('-created_date', limit, skip);
      if (!batch || batch.length === 0) break;
      allUsers = allUsers.concat(batch);
      skip += limit;
      hasMore = batch.length === limit;
    }

    console.log(`Sync: found ${allUsers.length} total users`);

    // Build a Stripe customer lookup by email — catches users whose stripe_customer_id was never linked
    const stripeCustomersByEmail = {};
    let custHasMore = true;
    let custStartingAfter = null;
    while (custHasMore) {
      const custParams = { limit: 100 };
      if (custStartingAfter) custParams.starting_after = custStartingAfter;
      const customers = await stripe.customers.list(custParams);
      for (const c of customers.data) {
        if (c.email) {
          stripeCustomersByEmail[c.email.toLowerCase()] = c;
        }
      }
      custHasMore = customers.has_more;
      if (customers.data.length > 0) {
        custStartingAfter = customers.data[customers.data.length - 1].id;
      }
    }
    console.log(`Sync: found ${Object.keys(stripeCustomersByEmail).length} Stripe customers`);

    const results = {
      checked: 0,
      updated: 0,
      alreadyCorrect: 0,
      noStripeId: 0,
      errors: [],
      changes: [],
    };

    for (const u of allUsers) {
      results.checked++;

      // Use stored stripe_customer_id, or fall back to email-based lookup
      let customerId = u.stripe_customer_id;
      if (!customerId && u.email) {
        const stripeCustomer = stripeCustomersByEmail[u.email.toLowerCase()];
        if (stripeCustomer) {
          customerId = stripeCustomer.id;
        }
      }

      if (!customerId) {
        results.noStripeId++;
        continue;
      }

      try {
        // Fetch all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          limit: 10,
        });

        if (!subscriptions.data || subscriptions.data.length === 0) {
          // No subscriptions found in Stripe — if user thinks they're trial/active, mark expired
          if (u.subscription_status === 'trial' || u.subscription_status === 'active') {
            await base44.asServiceRole.entities.User.update(u.id, {
              subscription_status: 'expired',
            });
            results.updated++;
            results.changes.push({
              userId: u.id,
              email: u.email,
              oldStatus: u.subscription_status,
              newStatus: 'expired',
              reason: 'No subscriptions found in Stripe',
            });
          } else {
            results.alreadyCorrect++;
          }
          continue;
        }

        // Use the most recent subscription
        const sub = subscriptions.data[0];
        let stripeStatus = 'expired';
        let renewalDate = null;
        let trialEndDate = null;

        if (sub.status === 'active') {
          stripeStatus = 'active';
        } else if (sub.status === 'trialing') {
          stripeStatus = 'trial';
          if (sub.trial_end) {
            trialEndDate = new Date(sub.trial_end * 1000).toISOString().split('T')[0];
          }
        } else if (sub.status === 'past_due' || sub.status === 'unpaid') {
          stripeStatus = 'grace_period';
        } else if (sub.status === 'canceled' || sub.status === 'cancelled') {
          stripeStatus = 'cancelled';
        }

        if (sub.current_period_end) {
          renewalDate = new Date(sub.current_period_end * 1000).toISOString();
        }

        // Always link stripe_customer_id if it was missing
        const needsCustomerIdLink = !u.stripe_customer_id;

        // Only update if the status doesn't match or customer ID was missing
        if (u.subscription_status !== stripeStatus || needsCustomerIdLink) {
          const updateData = {
            subscription_status: stripeStatus,
          };
          if (needsCustomerIdLink) {
            updateData.stripe_customer_id = customerId;
            updateData.stripe_subscription_id = sub.id;
          }
          if (renewalDate) updateData.renewal_date = renewalDate;
          if (trialEndDate) updateData.trial_end_date = trialEndDate;
          if (stripeStatus === 'active') {
            updateData.grace_period_start = null;
            updateData.cancelled_date = null;
          }
          if (stripeStatus === 'cancelled') {
            updateData.cancelled_date = new Date().toISOString().split('T')[0];
          }
          if (stripeStatus === 'grace_period' && !u.grace_period_start) {
            updateData.grace_period_start = new Date().toISOString();
          }

          await base44.asServiceRole.entities.User.update(u.id, updateData);
          results.updated++;
          results.changes.push({
            userId: u.id,
            email: u.email,
            oldStatus: u.subscription_status,
            newStatus: stripeStatus,
            stripeSubStatus: sub.status,
            renewalDate,
          });
          console.log(`Updated ${u.email}: ${u.subscription_status} → ${stripeStatus}`);
        } else {
          results.alreadyCorrect++;
        }
      } catch (err) {
        results.errors.push({
          userId: u.id,
          email: u.email,
          error: err.message,
        });
        console.error(`Error syncing user ${u.email}:`, err.message);
      }
    }

    console.log(`Sync complete: ${results.updated} updated, ${results.alreadyCorrect} already correct, ${results.noStripeId} without Stripe ID`);
    return Response.json(results);
  } catch (error) {
    console.error('syncSubscriptions error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});