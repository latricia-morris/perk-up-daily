import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sun, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const perks = [
  'Three daily uplift sessions (morning, midday, evening)',
  'Unlimited personal entries in your vault',
  'Life Wins and milestone tracking',
  'Curated library of quotes and affirmations',
  'AI-powered content guard',
  'Christian content option',
];

export default function Paywall() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    // Block checkout inside iframe (preview/editor)
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Please open the live app to subscribe.');
      return;
    }

    setLoading(true);
    try {
      const origin = window.location.origin;
      const response = await base44.functions.invoke('createCheckoutSession', {
        plan: selectedPlan,
        successUrl: `${origin}/dashboard?subscribed=true`,
        cancelUrl: `${origin}/paywall`,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        alert('Could not start checkout. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sun className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
            Start your free trial
          </h2>
          <p className="text-muted-foreground text-sm">
            7 days free on the monthly plan. Cancel anytime.
          </p>
        </div>

        {/* Plan selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
              selectedPlan === 'monthly'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/40'
            }`}
          >
            <div className="text-xs font-medium text-primary mb-1 uppercase tracking-wide">Monthly</div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-display font-bold text-foreground">$4.99</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">per month</div>
            <div className="mt-2 text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 inline-block">
              7-day free trial
            </div>
          </button>

          {/* Annual */}
          <button
            onClick={() => setSelectedPlan('annual')}
            className={`relative rounded-2xl border-2 p-4 text-left transition-all ${
              selectedPlan === 'annual'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/40'
            }`}
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                Best Value
              </span>
            </div>
            <div className="text-xs font-medium text-primary mb-1 uppercase tracking-wide">Annual</div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-display font-bold text-foreground">$39.99</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">per year</div>
            <div className="mt-2 text-[10px] text-muted-foreground">
              $3.33 / month
            </div>
          </button>
        </div>

        {/* Perks */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-3">
          {perks.map(perk => (
            <div key={perk} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-foreground">{perk}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={handleCheckout}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
          disabled={loading}
        >
          {loading ? 'Redirecting...' : selectedPlan === 'monthly' ? 'Start 7-day free trial' : 'Subscribe annually'}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
          {selectedPlan === 'monthly'
            ? 'Your trial starts today. No charge until day 8. Cancel anytime.'
            : 'Billed once per year. Cancel anytime in settings.'}
        </p>
      </motion.div>
    </div>
  );
}