import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BillingHelp from '@/components/BillingHelp';

/**
 * SubscriptionGuard — resilient subscription gate.
 *
 * Internal states:
 *   checking              — first auth call in-flight
 *   allowed               — trial_active | active | renewal_not_due | grace_period (valid)
 *   verification_error    — transient error / unknown status → fail open, retry in background
 *   billing_issue         — retries exhausted AND status is non-terminal, or grace expired
 *   denied                — confirmed expired / cancelled / trial ended → /paywall
 *
 * Retry schedule (background, does NOT interrupt user):
 *   Attempt 1 failed → retry after 3 min
 *   Attempt 2 failed → retry after 2 min
 *   After that → billing_issue (NOT /paywall)
 *
 * Only genuinely confirmed states (cancelled, expired, trial_ended) send to /paywall.
 */

const TRIAL_DAYS = 7;

function isTrialActive(user) {
  // Prefer an explicit trial_end_date field if it exists
  if (user.trial_end_date) {
    return new Date() < new Date(user.trial_end_date);
  }
  // Fall back to trial_start_date + 7 days
  if (user.trial_start_date) {
    const end = new Date(user.trial_start_date);
    end.setDate(end.getDate() + TRIAL_DAYS);
    return new Date() < end;
  }
  // No trial date info at all — assume trial is still valid rather than punish user
  return true;
}

function isGracePeriodValid(user) {
  if (!user.grace_period_start) return false;
  const days = Math.floor((new Date() - new Date(user.grace_period_start)) / 86400000);
  return days < 3;
}

function resolveStatus(user) {
  if (!user) return 'unknown';
  const s = user.subscription_status;

  if (s === 'active') return 'allowed';

  if (s === 'trial') {
    return isTrialActive(user) ? 'allowed' : 'denied'; // trial ended without payment → paywall
  }

  if (s === 'grace_period') {
    return isGracePeriodValid(user) ? 'allowed' : 'billing_issue';
  }

  // Stripe sometimes sets these on renewal; treat as allowed until confirmed otherwise
  if (s === 'renewal_not_due' || s === 'past_due') {
    return 'allowed';
  }

  if (s === 'cancelled' || s === 'expired' || s === 'trial_ended') {
    return 'denied';
  }

  // null / undefined / any unknown value → do NOT deny; treat as transient
  return 'unknown';
}

export default function SubscriptionGuard({ children }) {
  const navigate = useNavigate();
  const [guardState, setGuardState] = useState('checking');
  const retryCountRef = useRef(0);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleRetry = () => {
    const delays = [3 * 60 * 1000, 2 * 60 * 1000]; // 3 min, then 2 min
    const attempt = retryCountRef.current;
    if (attempt < delays.length) {
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) runCheck(true);
      }, delays[attempt]);
      retryCountRef.current += 1;
    } else {
      // Retries exhausted — show billing help, not paywall
      if (mountedRef.current) setGuardState('billing_issue');
    }
  };

  const runCheck = async (isRetry = false) => {
    try {
      const u = await base44.auth.me();
      if (!mountedRef.current) return;

      const resolved = resolveStatus(u);

      if (resolved === 'allowed') {
        setGuardState('allowed');
        return;
      }

      if (resolved === 'denied') {
        setGuardState('denied');
        navigate('/paywall', { replace: true });
        return;
      }

      if (resolved === 'billing_issue') {
        setGuardState('billing_issue');
        return;
      }

      // 'unknown' — transient / null status
      if (!isRetry) {
        // First check returned unknown: keep user in app, retry in background
        setGuardState('verification_error');
      }
      scheduleRetry();

    } catch (err) {
      console.warn('SubscriptionGuard check failed:', err);
      if (!mountedRef.current) return;
      if (!isRetry) {
        // First attempt threw — fail open, retry in background
        setGuardState('verification_error');
      }
      scheduleRetry();
    }
  };

  useEffect(() => {
    runCheck(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (guardState === 'checking') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (guardState === 'billing_issue') {
    return <BillingHelp />;
  }

  if (guardState === 'denied') {
    // Navigation already fired; render nothing while redirecting
    return null;
  }

  // allowed OR verification_error — render the page, optionally with a soft banner
  return (
    <>
      {guardState === 'verification_error' && (
        <div className="w-full text-center py-2 px-4 text-xs" style={{ background: '#fff8ed', color: '#9a6a1e' }}>
          Verifying your subscription in the background — your access is unaffected.
        </div>
      )}
      {children}
    </>
  );
}