import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

/**
 * Central subscription gate.
 * Only users with an active subscription (or a still-valid trial/grace window)
 * may access the app. Everyone else is redirected to /paywall.
 *
 * The user record is kept in sync by the Stripe webhook (stripeWebhook.js),
 * which sets subscription_status to active/trial/grace_period/cancelled/expired.
 */
export default function SubscriptionGuard({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      try {
        const u = await base44.auth.me();
        if (!mounted) return;

        const s = u.subscription_status;

        // Only active or trial users get through.
        if (s === 'active' || s === 'trial') {
          setStatus('allowed');
          return;
        }

        // Grace period: 3-day window after a payment failure.
        if (s === 'grace_period' && u.grace_period_start) {
          const days = Math.floor(
            (new Date() - new Date(u.grace_period_start)) / (1000 * 60 * 60 * 24)
          );
          if (days < 3) {
            setStatus('allowed');
            return;
          }
          // Grace expired — lock down.
          await base44.auth.updateMe({
            subscription_status: 'cancelled',
            cancelled_date: new Date().toISOString().split('T')[0],
          });
        }

        setStatus('denied');
        navigate('/paywall', { replace: true });
      } catch (err) {
        console.error('SubscriptionGuard verify failed:', err);
        if (mounted) {
          setStatus('denied');
          navigate('/paywall', { replace: true });
        }
      }
    };

    verify();
    return () => { mounted = false; };
  }, [navigate]);

  if (status === 'checking') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'denied') return null;

  return children;
}