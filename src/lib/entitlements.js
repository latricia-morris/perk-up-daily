/**
 * Centralized entitlement / access-decision logic.
 *
 * Single source of truth for allow / grace / deny decisions.
 * Used by SubscriptionGuard. Do not duplicate this logic elsewhere.
 *
 * Returns one of:
 *   'allow'  — user is entitled (admin, active with future renewal, valid trial, valid grace)
 *   'grace'  — entitlement uncertain or renewal date passed → allow access + background revalidation
 *   'deny'   — confirmed unpaid / expired / cancelled / trial ended without payment
 */

const TRIAL_DAYS = 7;
const GRACE_DAYS = 3;

function isTrialActive(user) {
  if (user.trial_end_date) {
    return new Date() < new Date(user.trial_end_date);
  }
  if (user.trial_start_date) {
    const end = new Date(user.trial_start_date);
    end.setDate(end.getDate() + TRIAL_DAYS);
    return new Date() < end;
  }
  // No trial date info — assume trial is still valid (don't punish the user)
  return true;
}

function isGracePeriodValid(user) {
  if (!user.grace_period_start) return false;
  const days = Math.floor((new Date() - new Date(user.grace_period_start)) / 86400000);
  return days < GRACE_DAYS;
}

/**
 * @param {object} user — the full user record from base44.auth.me()
 * @returns {'allow' | 'grace' | 'deny'}
 */
export function resolveAccess(user) {
  if (!user) return 'grace'; // Data not loaded yet — don't hard-block

  // Admin always allowed — never gate admin accounts behind billing
  if (user.role === 'admin') return 'allow';

  const status = user.subscription_status;

  switch (status) {
    case 'active':
      // If we have a renewal date, check it; otherwise trust the webhook
      if (user.renewal_date) {
        const renewal = new Date(user.renewal_date);
        if (renewal > new Date()) return 'allow';
        return 'grace'; // Renewal date passed — silent revalidation
      }
      return 'allow';

    case 'trial':
      return isTrialActive(user) ? 'allow' : 'deny';

    case 'grace_period':
      return isGracePeriodValid(user) ? 'allow' : 'deny';

    case 'cancelled':
    case 'expired':
      return 'deny';

    default:
      // null, undefined, or any unknown status — don't hard-block
      return 'grace';
  }
}

/**
 * Returns diagnostic info for debug logging.
 * Called by SubscriptionGuard when DEBUG flag is on.
 */
export function describeUser(user) {
  if (!user) return { loaded: false };
  return {
    loaded: true,
    status_field: 'subscription_status',
    status_value: user.subscription_status,
    role_value: user.role,
    is_admin: user.role === 'admin',
    is_paid: user.subscription_status === 'active',
    renewal_date: user.renewal_date || null,
    trial_start_date: user.trial_start_date || null,
    trial_end_date: user.trial_end_date || null,
    grace_period_start: user.grace_period_start || null,
    stripe_customer_id: user.stripe_customer_id || null,
  };
}