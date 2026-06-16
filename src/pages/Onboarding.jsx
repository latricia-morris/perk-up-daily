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

  const visibleCategories = christianContent
    ? CATEGORIES
    : CATEGORIES.filter(c => !c.requiresChristian);

  const handleFinish = () => {
    localStorage.setItem('perkup-onboarding', JSON.stringify({
      christianContent,
      selectedCategories,
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
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Make it yours
              </h2>

              {/* Christian content toggle */}
              <div className="mb-8">
                <p className="text-sm font-medium text-foreground mb-3">
                  Include Christian content?
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

              {/* Category selection */}
              {christianContent !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Choose up to 3 areas you want encouragement in
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">Select at least 1</p>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {visibleCategories.map(cat => {
                      const selected = selectedCategories.includes(cat.slug);
                      const disabled = !selected && selectedCategories.length >= 3;
                      return (
                        <button
                          key={cat.slug}
                          onClick={() => !disabled && toggleCategory(cat.slug)}
                          disabled={disabled}
                          className={`relative p-4 rounded-xl border text-left transition-all ${
                            selected
                              ? 'bg-primary/10 border-primary/40'
                              : disabled
                              ? 'opacity-40 cursor-not-allowed bg-card border-border'
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

                  <Button
                    onClick={() => setStep(3)}
                    disabled={selectedCategories.length === 0}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
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
              <p className="text-muted-foreground leading-relaxed mb-8">
                Create your account to start capturing the good stuff. 
                Your preferences are saved and ready to go.
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