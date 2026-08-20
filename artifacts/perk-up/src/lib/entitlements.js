/**
 * Centralized entitlement / access-decision logic.
 *
 * Returns one of:
 *   'allow'  — user has access (admin, active, valid trial, within grace period)
 *   'deny'   — confirmed unpaid / expired / cancelled / trial ended / grace period exceeded
 *
 * Unknown or missing data ALWAYS returns 'allow' — never block the user
 * while data is loading or retrieval fails. The webhook is the source of
 * truth for subscription state; we trust it rather than client-side date math.
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
  return true;
}

function isGracePeriodValid(user) {
  if (!user.grace_period_start) return false;
  const days = Math.floor((new Date() - new Date(user.grace_period_start)) / 86400000);
  return days < GRACE_DAYS;
}

/**
 * @param {object} user — the full user record from base44.auth.me()
 * @returns {'allow' | 'deny'}
 */
export function resolveAccess(user) {
  // No user data yet — never block. Background retry handles this.
  if (!user) return 'allow';

  // Admin always allowed
  if (user.isAdmin === true) return 'allow';

  const status = user.subscription_status;

  switch (status) {
    case 'active':
      // Trust the webhook. If payment failed, webhook sets grace_period or cancelled.
      // Do NOT client-side check renewal_date — that caused false lockouts.
      return 'allow';

    case 'trial':
      return isTrialActive(user) ? 'allow' : 'deny';

    case 'grace_period':
      return isGracePeriodValid(user) ? 'allow' : 'deny';

    case 'cancelled':
    case 'expired':
      return 'deny';

    default:
      // null, undefined, or any unknown status — never block
      return 'allow';
  }
}

/**
 * Returns diagnostic info for debug logging.
 */
export function describeUser(user) {
  if (!user) return { loaded: false };
  return {
    loaded: true,
    status_value: user.subscription_status,
    role_value: user.isAdmin === true ? 'admin' : null,
    is_admin: user.isAdmin === true,
    is_paid: user.subscription_status === 'active',
    renewal_date: user.renewal_date || null,
    trial_start_date: user.trial_start_date || null,
    trial_end_date: user.trial_end_date || null,
    grace_period_start: user.grace_period_start || null,
    stripe_customer_id: user.stripe_customer_id || null,
  };
}