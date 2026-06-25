import { AlertCircle, CreditCard, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * BillingHelp — soft paywall / billing-issue screen.
 *
 * NOT the standard acquisition paywall. Two modes:
 *   mode="verification" — retries exhausted, couldn't verify billing (may be an error)
 *   mode="expired"      — confirmed expired/inactive subscription
 *
 * Both modes offer: update billing + "this seems incorrect" report button.
 */
export default function BillingHelp({ mode = 'verification' }) {
  const isExpired = mode === 'expired';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#fff3dc' }}>
            {isExpired ? (
              <CreditCard className="w-7 h-7" style={{ color: '#d4830a' }} />
            ) : (
              <AlertCircle className="w-7 h-7" style={{ color: '#d4830a' }} />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold" style={{ color: '#2c1e0f' }}>
            {isExpired
              ? 'Your subscription appears expired'
              : "We couldn't verify your billing"}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#7a5c3a' }}>
            {isExpired
              ? "It looks like your subscription is no longer active. If you believe this is an error, let us know — your account and everything in it is safe."
              : "This might just be a temporary hiccup — it happens sometimes. Your account and everything in it is safe. If you believe your subscription is active, this is likely an error on our end."}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            className="w-full"
            onClick={() => window.location.href = '/paywall'}
          >
            {isExpired ? 'Renew or update payment' : 'Review or update billing'}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const subject = encodeURIComponent(
                isExpired
                  ? 'Subscription expired — I believe this is an error'
                  : 'Billing verification issue — I believe this is an error'
              );
              const body = encodeURIComponent(
                'Hi,\n\nI received a billing message in the app but believe my subscription is active. Could you please look into this?\n\nThanks.'
              );
              window.open(`mailto:perkupdaily@gmail.com?subject=${subject}&body=${body}`, '_blank');
            }}
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            This seems incorrect
          </Button>
        </div>

        <p className="text-xs" style={{ color: '#a08060' }}>
          If you just subscribed, it can take a moment for your status to sync.{' '}
          <button
            className="underline font-medium"
            onClick={() => window.location.reload()}
          >
            Try refreshing
          </button>
          .
        </p>
      </div>
    </div>
  );
}