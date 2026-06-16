import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [christianContent, setChristianContent] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (slug) => {
    setSelectedCategories(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  // Show all non-christian categories first; add deep_faith if christianContent is true
  const visibleCategories = christianContent === true
    ? CATEGORIES
    : CATEGORIES.filter(c => !c.requiresChristian);

  const handleFinish = () => {
    const cats = christianContent === true ? selectedCategories : selectedCategories.filter(c => c !== 'deep_faith');
    localStorage.setItem('perkup-onboarding', JSON.stringify({
      christianContent: christianContent || false,
      selectedCategories: cats,
    }));
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-3xl font-semibold text-foreground mb-3">
                Welcome to Perk Up Daily
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                This is your space to capture the good stuff.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Log your wins, blessings, and bright moments. We will resurface them
                throughout your day so the good things stay close.
              </p>
              <Button
                onClick={() => setStep(2)}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Let's go <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Choose your areas
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Select the areas you want encouragement in. Pick as many as you like.
              </p>

              {/* Category selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {visibleCategories.map(cat => {
                  const selected = selectedCategories.includes(cat.slug);
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => toggleCategory(cat.slug)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        selected
                          ? 'bg-primary/10 border-primary/40'
                          : 'bg-card border-border hover:border-primary/30'
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <span className="text-lg mb-1 block">{cat.emoji}</span>
                      <span className="text-sm font-medium text-foreground">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Christian content toggle — after categories */}
              <div className="mb-8 p-4 rounded-xl bg-muted/40 border border-border">
                <p className="text-sm font-medium text-foreground mb-3">
                  Would you like to include Christian content?
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  This adds scriptures and faith-based encouragement to your deliveries.
                </p>
                <div className="flex gap-3">
                  {[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ].map(opt => (
                    <button
                      key={String(opt.value)}
                      onClick={() => {
                        setChristianContent(opt.value);
                        if (!opt.value) {
                          setSelectedCategories(prev => prev.filter(c => c !== 'deep_faith'));
                        }
                      }}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        christianContent === opt.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep(3)}
                disabled={selectedCategories.length === 0 || christianContent === null}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
                You're almost in
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Create your account to start capturing the good stuff.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Once you're in, you'll add your first entry so there's something great
                waiting for you tomorrow morning.
              </p>
              <Button
                onClick={handleFinish}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Create your account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-primary underline">
                  Log in
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}