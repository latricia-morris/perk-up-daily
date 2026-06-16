import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Sun, Sparkles, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const perks = [
  'Three daily uplift sessions',
  'Unlimited personal entries',
  'Milestone tracking by category',
  'Curated library of quotes and affirmations',
  'AI-powered content guard',
  'Christian content option',
];

export default function Paywall() {
  const navigate = useNavigate();

  const handleStart = async () => {
    const today = new Date().toISOString().split('T')[0];
    await base44.auth.updateMe({
      subscription_status: 'trial',
      trial_start_date: today,
      onboarding_completed: true,
    });
    navigate('/dashboard');
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
            7 days free. Then $3.99/month. Cancel anytime.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-3xl font-display font-bold text-foreground">$3.99</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>

          <div className="space-y-3">
            {perks.map(perk => (
              <div key={perk} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-secondary" />
                </div>
                <span className="text-sm text-foreground">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleStart}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          Start 7-day free trial
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
          Your trial starts today. You won't be charged until your trial ends. 
          Cancel anytime in settings.
        </p>
      </motion.div>
    </div>
  );
}