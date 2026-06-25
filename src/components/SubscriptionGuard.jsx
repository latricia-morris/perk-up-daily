import { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { resolveAccess, describeUser } from '@/lib/entitlements';
import BillingHelp from '@/components/BillingHelp';

/**
 * SubscriptionGuard — entitlement-based access gate.
 *
 * Uses a centralized decision from lib/entitlements.js (single source of truth).
 *
 * States:
 *   checking           — auth call in-flight, show spinner
 *   allow              — render children
 *   grace              — render children + soft banner + background retry
 *   billing_issue      — retries exhausted, show BillingHelp (verification mode)
 *   deny               — confirmed unpaid/expired, show BillingHelp (expired mode)
 *
 * Retry schedule: 3 min, then 3 min. After that → billing_issue (NOT /paywall).
 */

const DEBUG = true; // Set to false to suppress debug logs in production

const RETRY_DELAYS = [3 * 60 * 1000, 3 * 60 * 1000]; // 3 min, then 3 min

function log(label, value) {
  if (!DEBUG) return;
  if (typeof value === 'object') {
    console.log(`SubscriptionGuard ${label}:`, value);
  } else {
    console.log(`SubscriptionGuard ${label}: ${value}`);
  }
}

export default function SubscriptionGuard({ children }) {
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
    const attempt = retryCountRef.current;
    if (attempt < RETRY_DELAYS.length) {
      log('loading state', `retry ${attempt + 1} scheduled in ${RETRY_DELAYS[attempt] / 1000}s`);
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) runCheck(true);
      }, RETRY_DELAYS[attempt]);
      retryCountRef.current += 1;
    } else {
      // Retries exhausted — billing issue, NOT paywall
      log('decision', 'billing_issue (retries exhausted)');
      if (mountedRef.current) setGuardState('billing_issue');
    }
  };

  const runCheck = async (isRetry = false) => {
    let user;
    try {
      user = await base44.auth.me();
    } catch (err) {
      log('loading state', `auth.me() threw: ${err.message}`);
      if (!mountedRef.current) return;
      if (!isRetry) setGuardState('grace');
      scheduleRetry();
      return;
    }

    if (!mountedRef.current) return;

    // Debug logging
    const info = describeUser(user);
    log('user', user);
    log('status field', info.status_field || 'N/A (user not loaded)');
    log('status value', info.status_value ?? 'null/undefined');
    log('role value', info.role_value ?? 'null/undefined');
    log('isAdmin', info.is_admin ?? false);
    log('isPaid', info.is_paid ?? false);
    log('renewalDate', info.renewal_date ?? 'null/undefined');

    if (!user) {
      log('loading state', 'user not loaded yet');
      if (!isRetry) setGuardState('grace');
      scheduleRetry();
      return;
    }

    const decision = resolveAccess(user);
    log('decision', decision);

    if (decision === 'allow') {
      setGuardState('allow');
      return;
    }

    if (decision === 'deny') {
      setGuardState('deny');
      return;
    }

    // 'grace' — allow access, retry in background
    if (!isRetry) setGuardState('grace');
    scheduleRetry();
  };

  useEffect(() => {
    runCheck(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Render ---

  if (guardState === 'checking') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (guardState === 'billing_issue') {
    return <BillingHelp mode="verification" />;
  }

  if (guardState === 'deny') {
    return <BillingHelp mode="expired" />;
  }

  // allow OR grace — render the page; grace shows a soft non-blocking banner
  return (
    <>
      {guardState === 'grace' && (
        <div className="w-full text-center py-2 px-4 text-xs" style={{ background: '#fff8ed', color: '#9a6a1e' }}>
          Verifying your subscription in the background — your access is unaffected.
        </div>
      )}
      {children}
    </>
  );
}