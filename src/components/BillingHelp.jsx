import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * BillingHelp — shown only after retries are exhausted and status is still unresolved.
 * This is NOT the standard acquisition paywall.
 * Tone: calm, reassuring, actionable.
 */
export default function BillingHelp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#fff3dc' }}>
            <AlertCircle className="w-7 h-7" style={{ color: '#d4830a' }} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold" style={{ color: '#2c1e0f' }}>
            We couldn't verify your billing
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#7a5c3a' }}>
            This might just be a temporary hiccup — it happens sometimes. Your account and everything in it is safe.
            If you believe your subscription is active, this is likely an error on our end.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            className="w-full"
            onClick={() => window.location.href = '/paywall'}
          >
            Review or update billing
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const subject = encodeURIComponent('Billing verification issue — I believe this is an error');
              const body = encodeURIComponent('Hi,\n\nI received a billing verification message in the app but believe my account is active. Could you please look into this?\n\nThanks.');
              window.open(`mailto:perkupdaily@gmail.com?subject=${subject}&body=${body}`, '_blank');
            }}
          >
            Let us know this is an error
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