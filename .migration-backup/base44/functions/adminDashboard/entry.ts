import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@14';

const DAY_MS = 86400000;

function dateKey(d) {
  return new Date(d).toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const startDate = body.start_date ? new Date(body.start_date) : new Date(Date.now() - 30 * DAY_MS);
    const endDate = body.end_date ? new Date(body.end_date) : new Date();
    const now = new Date();

    // === FETCH ENTITIES ===
    const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
    const entries = await base44.asServiceRole.entities.UserEntry.list('-created_date', 500);
    const deliveries = await base44.asServiceRole.entities.DeliveryLog.list('-created_date', 500);
    const library = await base44.asServiceRole.entities.AppLibrary.list('-created_date', 500);

    let uplifts = [];
    try {
      uplifts = await base44.asServiceRole.entities.SentUplifts.list('-created_date', 500);
    } catch {}

    // === USERS ===
    const totalUsers = users.length;
    const newSignups = users.filter(u => {
      const d = new Date(u.created_date);
      return d >= startDate && d <= endDate;
    });

    const byStatus = {};
    users.forEach(u => {
      const s = u.subscription_status || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });

    const onboardingCompleted = users.filter(u => u.onboarding_completed).length;

    const signupMap = {};
    users.forEach(u => {
      const k = dateKey(u.created_date);
      signupMap[k] = (signupMap[k] || 0) + 1;
    });
    const signupTimeline = Object.entries(signupMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-90);

    // === ENGAGEMENT ===
    const activityMap = {};
    function recordActivity(userId, date) {
      if (!userId) return;
      const k = dateKey(date);
      if (!activityMap[userId]) activityMap[userId] = new Set();
      activityMap[userId].add(k);
    }

    entries.forEach(e => recordActivity(e.created_by_id, e.created_date));
    deliveries.forEach(d => recordActivity(d.user_id, d.delivery_date || d.created_date));

    const oneDayAgo = new Date(now - DAY_MS);
    const sevenDaysAgo = new Date(now - 7 * DAY_MS);
    const thirtyDaysAgo = new Date(now - 30 * DAY_MS);

    const dauSet = new Set();
    const wauSet = new Set();
    const mauSet = new Set();

    entries.forEach(e => {
      const d = new Date(e.created_date);
      if (d >= oneDayAgo) dauSet.add(e.created_by_id);
      if (d >= sevenDaysAgo) wauSet.add(e.created_by_id);
      if (d >= thirtyDaysAgo) mauSet.add(e.created_by_id);
    });
    deliveries.forEach(d => {
      const dd = new Date(d.delivery_date || d.created_date);
      if (dd >= oneDayAgo) dauSet.add(d.user_id);
      if (dd >= sevenDaysAgo) wauSet.add(d.user_id);
      if (dd >= thirtyDaysAgo) mauSet.add(d.user_id);
    });

    // Active users in selected period
    const activeUserIds = new Set();
    entries.forEach(e => {
      const d = new Date(e.created_date);
      if (d >= startDate && d <= endDate) activeUserIds.add(e.created_by_id);
    });
    deliveries.forEach(d => {
      const dd = new Date(d.delivery_date || d.created_date);
      if (dd >= startDate && dd <= endDate) activeUserIds.add(d.user_id);
    });

    // Active user timeline (daily)
    const activeMap = {};
    entries.forEach(e => {
      const k = dateKey(e.created_date);
      if (!activeMap[k]) activeMap[k] = new Set();
      activeMap[k].add(e.created_by_id);
    });
    deliveries.forEach(d => {
      const k = dateKey(d.delivery_date || d.created_date);
      if (!activeMap[k]) activeMap[k] = new Set();
      activeMap[k].add(d.user_id);
    });
    const activeTimeline = Object.entries(activeMap)
      .map(([date, set]) => ({ date, count: set.size }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-90);

    // Retention
    function calcRetention(days) {
      const eligible = users.filter(u => {
        const signup = new Date(u.created_date);
        return now - signup >= days * DAY_MS;
      });
      if (eligible.length === 0) return 0;
      let retained = 0;
      eligible.forEach(u => {
        const signupDate = new Date(u.created_date);
        const targetStart = new Date(signupDate.getTime() + DAY_MS);
        const targetEnd = new Date(signupDate.getTime() + days * DAY_MS);
        const userActivity = activityMap[u.id];
        if (userActivity) {
          for (const dateStr of userActivity) {
            const d = new Date(dateStr);
            if (d >= targetStart && d <= targetEnd) {
              retained++;
              break;
            }
          }
        }
      });
      return Math.round((retained / eligible.length) * 100);
    }

    // === FEATURES ===
    const entryTypeMap = {};
    entries.forEach(e => {
      const t = e.entry_type || 'unknown';
      entryTypeMap[t] = (entryTypeMap[t] || 0) + 1;
    });

    const categoryMap = {};
    entries.forEach(e => {
      const c = e.category || 'unknown';
      categoryMap[c] = (categoryMap[c] || 0) + 1;
    });

    const libraryTypeMap = {};
    library.forEach(l => {
      const t = l.content_type || 'unknown';
      libraryTypeMap[t] = (libraryTypeMap[t] || 0) + 1;
    });

    const libraryCategoryMap = {};
    library.forEach(l => {
      const c = l.category || 'unknown';
      libraryCategoryMap[c] = (libraryCategoryMap[c] || 0) + 1;
    });

    // === STRIPE ===
    let salesData = null;
    try {
      const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

      let allSubs = [];
      let hasMore = true;
      let startingAfter = null;
      while (hasMore && allSubs.length < 1000) {
        const params = { limit: 100 };
        if (startingAfter) params.starting_after = startingAfter;
        const subs = await stripe.subscriptions.list(params);
        allSubs = allSubs.concat(subs.data);
        hasMore = subs.has_more;
        if (subs.data.length > 0) startingAfter = subs.data[subs.data.length - 1].id;
        else break;
      }

      let mrr = 0;
      let activeSubs = 0;
      let newSubs = 0;
      let cancellations = 0;
      let totalRevenue = 0;
      const planBreakdown = {};

      allSubs.forEach(sub => {
        const item = sub.items?.data?.[0];
        const price = item?.price;
        const amount = price?.unit_amount || 0;
        const interval = price?.recurring?.interval;

        let monthlyContribution = 0;
        if (interval === 'month') monthlyContribution = amount / 100;
        else if (interval === 'year') monthlyContribution = (amount / 100) / 12;

        if (sub.status === 'active' || sub.status === 'trialing') {
          mrr += monthlyContribution;
          activeSubs++;
          totalRevenue += amount / 100;

          const planKey = interval || 'unknown';
          if (!planBreakdown[planKey]) planBreakdown[planKey] = { users: 0, mrr: 0, revenue: 0 };
          planBreakdown[planKey].users++;
          planBreakdown[planKey].mrr += monthlyContribution;
          planBreakdown[planKey].revenue += amount / 100;

          if (sub.current_period_start && new Date(sub.current_period_start * 1000) >= startDate) {
            newSubs++;
          }
        }

        if (sub.status === 'canceled') {
          if (sub.canceled_at) {
            const canceledDate = new Date(sub.canceled_at * 1000);
            if (canceledDate >= startDate && canceledDate <= endDate) {
              cancellations++;
            }
          }
        }
      });

      const churnRate = (activeSubs + cancellations) > 0
        ? (cancellations / (activeSubs + cancellations)) * 100
        : 0;
      const arpu = activeSubs > 0 ? mrr / activeSubs : 0;

      // Forecast
      const forecast = [];
      let projectedMrr = mrr;
      let projectedSubs = activeSubs;
      const avgNewSubsPerMonth = newSubs > 0 ? newSubs : 1;
      const monthlyChurnRate = churnRate / 100;
      const avgRevPerSub = arpu;

      for (let i = 1; i <= 6; i++) {
        const newSubsMrr = avgNewSubsPerMonth * avgRevPerSub;
        const churnedMrr = projectedSubs * monthlyChurnRate * avgRevPerSub;
        projectedMrr = Math.max(0, projectedMrr + newSubsMrr - churnedMrr);
        projectedSubs = Math.max(0, projectedSubs + avgNewSubsPerMonth - Math.round(projectedSubs * monthlyChurnRate));
        const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
        forecast.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          projected_mrr: Math.round(projectedMrr * 100) / 100,
          projected_subs: Math.round(projectedSubs)
        });
      }

      salesData = {
        mrr: Math.round(mrr * 100) / 100,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        active_subs: activeSubs,
        new_subs: newSubs,
        cancellations: cancellations,
        churn_rate: Math.round(churnRate * 10) / 10,
        arpu: Math.round(arpu * 100) / 100,
        plan_breakdown: Object.entries(planBreakdown).map(([plan, data]) => ({
          plan,
          users: data.users,
          mrr: Math.round(data.mrr * 100) / 100,
          revenue: Math.round(data.revenue * 100) / 100
        })),
        forecast,
        forecast_assumptions: {
          avg_new_subs_per_month: avgNewSubsPerMonth,
          churn_rate: Math.round(churnRate * 10) / 10,
          avg_revenue_per_sub: Math.round(avgRevPerSub * 100) / 100
        }
      };
    } catch (stripeError) {
      console.error('Stripe error:', stripeError.message);
      salesData = { error: stripeError.message };
    }

    // === ALERTS ===
    const alerts = [];
    if (salesData && !salesData.error) {
      if (salesData.churn_rate > 5) {
        alerts.push({ type: 'warning', message: `Churn rate is ${salesData.churn_rate}% — above the 5% threshold` });
      }
      if (salesData.new_subs > 0 && salesData.cancellations > salesData.new_subs) {
        alerts.push({ type: 'warning', message: `Cancellations (${salesData.cancellations}) exceed new subscriptions (${salesData.new_subs}) this period` });
      }
    }
    if (totalUsers > 10 && onboardingCompleted / totalUsers < 0.5) {
      alerts.push({ type: 'warning', message: `Only ${Math.round((onboardingCompleted / totalUsers) * 100)}% of users complete onboarding` });
    }
    const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      alerts.push({ type: 'info', message: `${topCategory[0].replace(/_/g, ' ')} is your most active category with ${topCategory[1]} entries` });
    }
    if (mauSet.size > 0) {
      const stickiness = Math.round((dauSet.size / mauSet.size) * 100);
      if (stickiness < 20) {
        alerts.push({ type: 'info', message: `DAU/MAU stickiness is ${stickiness}% — consider re-engagement campaigns` });
      }
    }

    // === USER LIST (for management) ===
    const userList = users.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      subscription_status: u.subscription_status,
      created_date: u.created_date,
      onboarding_completed: u.onboarding_completed,
      renewal_date: u.renewal_date,
      phone_number: u.phone_number,
      sms_consent: u.sms_consent,
      trial_end_date: u.trial_end_date,
      cancelled_date: u.cancelled_date,
      stripe_customer_id: u.stripe_customer_id,
      selected_categories: u.selected_categories,
      christian_content: u.christian_content,
      access_expires_at: u.access_expires_at
    }));

    return Response.json({
      users: {
        total: totalUsers,
        new_signups: newSignups.length,
        signup_timeline: signupTimeline,
        by_status: byStatus,
        onboarding_completion_rate: totalUsers > 0 ? Math.round((onboardingCompleted / totalUsers) * 100) : 0,
        onboarding_completed: onboardingCompleted,
        onboarding_not_completed: totalUsers - onboardingCompleted
      },
      engagement: {
        sessions: deliveries.length,
        active_users: activeUserIds.size,
        dau: dauSet.size,
        wau: wauSet.size,
        mau: mauSet.size,
        active_timeline: activeTimeline,
        retention: {
          d1: calcRetention(1),
          d7: calcRetention(7),
          d30: calcRetention(30)
        },
        uplifts_sent: uplifts.length
      },
      features: {
        entry_type_breakdown: Object.entries(entryTypeMap).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
        category_breakdown: Object.entries(categoryMap).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
        library_distribution: Object.entries(libraryTypeMap).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
        library_category_breakdown: Object.entries(libraryCategoryMap).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
        total_entries: entries.length,
        total_library: library.length,
        total_uplifts: uplifts.length
      },
      sales: salesData,
      alerts,
      user_list: userList,
      truncated: users.length >= 500 || entries.length >= 500
    });
  } catch (error) {
    console.error('Admin dashboard error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});