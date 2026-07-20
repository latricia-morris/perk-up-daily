import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import LegalLinks from '@/components/shared/LegalLinks';
import { CATEGORIES } from '@/lib/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TIME_OPTIONS = {
  morning: [
    { value: '05:00', label: '5:00 AM' },
    { value: '05:30', label: '5:30 AM' },
    { value: '06:00', label: '6:00 AM' },
    { value: '06:30', label: '6:30 AM' },
    { value: '07:00', label: '7:00 AM' },
    { value: '07:30', label: '7:30 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '08:30', label: '8:30 AM' },
    { value: '09:00', label: '9:00 AM' },
  ],
  midday: [
    { value: '11:00', label: '11:00 AM' },
    { value: '11:30', label: '11:30 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '12:30', label: '12:30 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '13:30', label: '1:30 PM' },
    { value: '14:00', label: '2:00 PM' },
  ],
  evening: [
    { value: '18:00', label: '6:00 PM' },
    { value: '18:30', label: '6:30 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '19:30', label: '7:30 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '20:30', label: '8:30 PM' },
    { value: '21:00', label: '9:00 PM' },
    { value: '21:30', label: '9:30 PM' },
    { value: '22:00', label: '10:00 PM' },
  ],
};

function TimeChip({ value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 px-4 rounded-full text-sm font-medium transition-all border"
      style={selected ? {
        background: '#E8A838',
        color: '#2c1e0f',
        borderColor: '#E8A838',
      } : {
        background: '#FDF8F0',
        color: '#7a5c3a',
        borderColor: '#e2d5c0',
      }}
    >
      {value}
    </button>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [christianContent, setChristianContent] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [birthday, setBirthday] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [smsConsent, setSmsConsent] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [times, setTimes] = useState({
    morning: '07:00',
    midday: '12:00',
    evening: '20:00',
  });

  const toggleCategory = (slug) => {
    setSelectedCategories(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const visibleCategories = christianContent === true
    ? CATEGORIES
    : CATEGORIES.filter(c => !c.requiresChristian);

  const handleFinish = () => {
    const cats = christianContent === true ? selectedCategories : selectedCategories.filter(c => c !== 'deep_faith');
    localStorage.setItem('perkup-onboarding', JSON.stringify({
      christianContent: christianContent || false,
      selectedCategories: cats,
      notificationTimes: times,
      birthday: birthday || null,
      phoneNumber: phoneNumber || null,
      countryCode,
      deliveryMethod: 'sms',
      smsConsent,
      analytics_consent: analyticsConsent,
      analytics_consent_timestamp: new Date().toISOString(),
    }));
    navigate('/register');
  };

  const TOTAL_STEPS = 7;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
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

          {/* Step 2: Categories + Christian toggle */}
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

              <div className="mb-8 p-4 rounded-xl bg-muted/40 border border-border">
                <p className="text-sm font-medium text-foreground mb-3">
                   Would you like to include Faith-Based content?
                 </p>
                 <p className="text-xs text-muted-foreground mb-3">
                   This adds Bible verses and faith-based encouragement to your deliveries.
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

          {/* Step 3: Notification times */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Set your daily rhythm
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                We'll deliver your perk-ups at these three times each day.
              </p>

              {/* Morning */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-1">🌅 What time do you wake up?</p>
                <p className="text-xs text-muted-foreground mb-3">Sets your morning delivery</p>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.morning.map(opt => (
                    <TimeChip
                      key={opt.value}
                      value={opt.label}
                      selected={times.morning === opt.value}
                      onClick={() => setTimes(t => ({ ...t, morning: opt.value }))}
                    />
                  ))}
                </div>
              </div>

              {/* Midday */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-1">☀️ What's your normal lunch time?</p>
                <p className="text-xs text-muted-foreground mb-3">Sets your midday delivery</p>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.midday.map(opt => (
                    <TimeChip
                      key={opt.value}
                      value={opt.label}
                      selected={times.midday === opt.value}
                      onClick={() => setTimes(t => ({ ...t, midday: opt.value }))}
                    />
                  ))}
                </div>
              </div>

              {/* Evening */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-foreground mb-1">🌙 What time do you wind down?</p>
                <p className="text-xs text-muted-foreground mb-3">Sets your evening reflection prompt</p>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.evening.map(opt => (
                    <TimeChip
                      key={opt.value}
                      value={opt.label}
                      selected={times.evening === opt.value}
                      onClick={() => setTimes(t => ({ ...t, evening: opt.value }))}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep(4)}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 4: Birthday */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
                When's your birthday?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We'll celebrate you with confetti and a special message on your big day. (Optional)
              </p>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex gap-3 mt-8">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(5)}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Phone number (SMS is the only delivery method) */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
                What's your phone number?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                We'll send your daily perk-ups via text message.
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Country</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="US">🇺🇸 United States (+1)</option>
                    <option value="CA">🇨🇦 Canada (+1)</option>
                    <option value="GB">🇬🇧 United Kingdom (+44)</option>
                    <option value="AU">🇦🇺 Australia (+61)</option>
                    <option value="NZ">🇳🇿 New Zealand (+64)</option>
                    <option value="IE">🇮🇪 Ireland (+353)</option>
                    <option value="ZA">🇿🇦 South Africa (+27)</option>
                    <option value="MX">🇲🇽 Mexico (+52)</option>
                    <option value="BR">🇧🇷 Brazil (+55)</option>
                    <option value="DE">🇩🇪 Germany (+49)</option>
                    <option value="FR">🇫🇷 France (+33)</option>
                    <option value="IT">🇮🇹 Italy (+39)</option>
                    <option value="ES">🇪🇸 Spain (+34)</option>
                    <option value="NL">🇳🇱 Netherlands (+31)</option>
                    <option value="SG">🇸🇬 Singapore (+65)</option>
                    <option value="HK">🇭🇰 Hong Kong (+852)</option>
                    <option value="JP">🇯🇵 Japan (+81)</option>
                    <option value="KR">🇰🇷 South Korea (+82)</option>
                    <option value="IN">🇮🇳 India (+91)</option>
                    <option value="AE">🇦🇪 United Arab Emirates (+971)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="5551234567"
                    className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Enter just the number (no country code needed)</p>
                </div>
              </div>

              {/* SMS Consent */}
              <div className="rounded-xl border border-border bg-card p-4 mb-6 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={smsConsent}
                    onCheckedChange={setSmsConsent}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-foreground leading-relaxed">
                    <strong>Yes, sign me up!</strong> I consent to receive recurring SMS messages from Perk Up
                    Daily, including daily encouragement, reminders, and occasional updates about features or
                    subscriptions.
                  </span>
                </label>
                <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1.5 pl-1">
                  <p><strong>Message frequency:</strong> Varies based on your settings (typically 1–3 messages per day).</p>
                  <p><strong>Message &amp; data rates may apply.</strong></p>
                  <p>Reply <strong>STOP</strong> at any time to unsubscribe. Reply <strong>HELP</strong> for help.</p>
                  <p>
                    By checking the box you agree to our{' '}
                    <a href="/terms" className="underline" style={{ color: '#E8A838' }}>Terms</a> and{' '}
                    <a href="/privacy-policy" className="underline" style={{ color: '#E8A838' }}>Privacy Policy</a>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(4)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(6)}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Phone number is optional — you can add it later in Settings.
              </p>
            </motion.div>
          )}

          {/* Step 6: Create account */}
          {step === 6 && (
            <motion.div
              key="step6"
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
                onClick={() => setStep(7)}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-primary underline">
                  Log in
                </button>
              </p>
            </motion.div>
          )}

          {/* Step 7: Consent */}
          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Your privacy choices
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                You're in control of how your data is used. Review and adjust below.
              </p>

              {/* Essential — locked on */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 mb-3 opacity-80">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">Essential app functionality</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Required for the app to work. Cannot be turned off.</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
              </div>

              {/* Analytics — off by default */}
              <div className="rounded-xl border border-border bg-card p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">Analytics &amp; personalization</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Helps us understand what's working so we can improve. Off by default — turn on if you'd like to help.</p>
                  </div>
                  <Switch
                    checked={analyticsConsent}
                    onCheckedChange={setAnalyticsConsent}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(6)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleFinish}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}