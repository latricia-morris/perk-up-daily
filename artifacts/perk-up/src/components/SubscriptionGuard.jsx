import { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { resolveAccess } from '@/lib/entitlements';
import BillingHelp from '@/components/BillingHelp';

/**
 * SubscriptionGuard — passive, invisible access gate.
 *
 * Renders children IMMEDIATELY. Never shows a spinner or banner.
 * Checks entitlement in the background. Only swaps to BillingHelp
 * if the user is confirmed expired (past 3-day grace period).
 *
 * Retries silently (3 min intervals) only if data retrieval fails.
 * After retries exhausted, stays in allow mode — never blocks.
 */

const RETRY_DELAYS = [3 * 60 * 1000, 3 * 60 * 1000]; // 3 min, then 3 min

export default function SubscriptionGuard({ children }) {
  const [denied, setDenied] = useState(false);
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
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) runCheck(true);
      }, RETRY_DELAYS[attempt]);
      retryCountRef.current += 1;
    }
    // Retries exhausted — stay in allow mode, don't block the user
  };

  const runCheck = async () => {
    let user;
    try {
      user = await base44.auth.me();
    } catch (err) {
      // Retrieval failed — retry silently, keep showing content
      scheduleRetry();
      return;
    }

    if (!mountedRef.current) return;

    if (!user) {
      // Data not loaded yet — retry silently
      scheduleRetry();
      return;
    }

    const decision = resolveAccess(user);

    if (decision === 'deny') {
      // Confirmed expired — show BillingHelp
      setDenied(true);
      return;
    }

    // allow — user has access, nothing to do
  };

  useEffect(() => {
    runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only swap to BillingHelp when truly denied.
  // Otherwise always render children — no spinner, no banner, no interruption.
  if (denied) {
    return <BillingHelp mode="expired" />;
  }

  return children;
}