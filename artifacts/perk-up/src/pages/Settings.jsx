import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, Loader2, Download, LifeBuoy, ExternalLink } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { MobileSelect } from '@/components/ui/mobile-select';
import LegalLinks from '@/components/shared/LegalLinks';
import BugReportSection from '@/components/shared/BugReportSection';
import { CATEGORIES } from '@/lib/constants';
import { getDialCode } from '@/lib/countryCodes';
import { useTheme } from '@/lib/useTheme';
import { motion } from 'framer-motion';
export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { theme, setTheme } = useTheme();

  const [prefs, setPrefs] = useState({
   christian_content: false,
   selected_categories: [],
   morning_enabled: true,
   midday_enabled: true,
   evening_enabled: true,
   morning_time: '07:00',
   midday_time: '12:00',
   evening_time: '19:00',
   phone_number: '',
   country_code: 'US',
   sms_consent: false,
   analytics_consent: false,
  });
  const [showTimeDropdown, setShowTimeDropdown] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      let cats = [];
      try { cats = JSON.parse(u.selected_categories || '[]'); } catch {}
      setPrefs({
         christian_content: u.christian_content || false,
         selected_categories: cats,
         morning_enabled: u.morning_enabled !== false,
         midday_enabled: u.midday_enabled !== false,
         evening_enabled: u.evening_enabled !== false,
         morning_time: u.morning_time || '07:00',
         midday_time: u.midday_time || '12:00',
         evening_time: u.evening_time || '19:00',
         phone_number: u.phone_number || '',
         country_code: u.country_code || 'US',
         sms_consent: u.sms_consent || false,
         analytics_consent: u.analytics_consent || false,
       });
      if (u.theme) setTheme(u.theme);
    });
  }, []);

  const toggleCategory = (slug) => {
    setPrefs(prev => ({
      ...prev,
      selected_categories: prev.selected_categories.includes(slug)
        ? prev.selected_categories.filter(s => s !== slug)
        : [...prev.selected_categories, slug],
    }));
  };

  const formatTimeLabel = (timeStr) => {
    if (!timeStr) return '7:00 AM';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  const generateTimeSlots = (session) => {
    const ranges = {
      morning: { start: 5, end: 10 },
      midday: { start: 11, end: 15 },
      evening: { start: 17, end: 23 },
    };
    const range = ranges[session] || ranges.morning;
    const slots = [];
    for (let h = range.start; h < range.end; h++) {
      for (const m of [0, 15, 30, 45]) {
        const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        slots.push({ value, label: `${hour12}:${String(m).padStart(2, '0')} ${period}` });
      }
    }
    return slots;
  };

  const handleSave = async () => {
    setValidationError('');
    
    // Validate SMS delivery method
    if (prefs.delivery_method === 'sms' && !prefs.phone_number) {
      setValidationError('Phone number is required for SMS delivery');
      return;
    }
    if (prefs.delivery_method === 'sms' && !prefs.sms_consent) {
      setValidationError('Please check the consent box to opt in to SMS messages');
      return;
    }

    setSaving(true);
    await base44.auth.updateMe({
      ...prefs,
      selected_categories: JSON.stringify(prefs.selected_categories),
      theme,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportEntries = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke('exportEntries', {});
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `perk-up-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const visibleCategories = prefs.christian_content
    ? CATEGORIES
    : CATEGORIES.filter(c => !c.requiresChristian);

  return (
    <div>
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-foreground mb-8">Settings</h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Content preferences */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Content</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <Label className="text-sm">Faith-Based Content</Label>
                 <Switch
                   checked={prefs.christian_content}
                   onCheckedChange={v => {
                     setPrefs(prev => ({
                       ...prev,
                       christian_content: v,
                       selected_categories: v
                         ? prev.selected_categories
                         : prev.selected_categories.filter(c => c !== 'deep_faith'),
                     }));
                   }}
                 />
               </div>
            </div>
          </section>

          {/* Categories */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Categories</h2>
            <div className="grid grid-cols-2 gap-2">
              {visibleCategories.map(cat => {
                const selected = prefs.selected_categories.includes(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    onClick={() => toggleCategory(cat.slug)}
                    className={`p-3 rounded-lg border text-left text-sm transition-all ${
                      selected
                        ? 'bg-primary/10 border-primary/40 text-foreground'
                        : 'bg-card border-border text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    <span className="mr-1.5">{cat.emoji}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Phone Number (SMS is the only delivery method) */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Phone number</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground mb-1.5 block">Country</Label>
                <select
                  value={prefs.country_code}
                  onChange={(e) => setPrefs(prev => ({ ...prev, country_code: e.target.value }))}
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
                <Label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-muted text-sm font-medium text-muted-foreground whitespace-nowrap">
                    +{getDialCode(prefs.country_code)}
                  </span>
                  <Input
                    type="tel"
                    value={prefs.phone_number}
                    onChange={(e) => setPrefs(prev => ({ ...prev, phone_number: e.target.value.replace(/\D/g, '') }))}
                    placeholder="5551234567"
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  We'll send texts to <strong>+{getDialCode(prefs.country_code)}{prefs.phone_number || '5551234567'}</strong>
                </p>
              </div>

              {/* Texting toggle */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-3">
                    <Label className="text-sm font-medium text-foreground">Text messages</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {prefs.sms_consent
                        ? 'On — you\'ll receive daily encouragement via text'
                        : 'Off — no text messages will be sent to you'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${prefs.sms_consent ? 'text-primary' : 'text-muted-foreground'}`}>
                      {prefs.sms_consent ? 'ON' : 'OFF'}
                    </span>
                    <Switch
                      checked={prefs.sms_consent}
                      onCheckedChange={v => setPrefs(prev => ({ ...prev, sms_consent: v }))}
                    />
                  </div>
                </div>
                {prefs.sms_consent && (
                  <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1.5 pl-1 pt-2 border-t border-border/50">
                    <p>I consent to receive recurring SMS messages from Perk Up Daily, including daily encouragement, reminders, and occasional updates about features or subscriptions.</p>
                    <p><strong>Message frequency:</strong> Varies based on your settings (typically 1–3 messages per day).</p>
                    <p><strong>Message &amp; data rates may apply.</strong></p>
                    <p>Reply <strong>STOP</strong> at any time to unsubscribe. Reply <strong>HELP</strong> for help.</p>
                    <div className="pt-1">
                      <LegalLinks />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Delivery Times with enable/disable toggles */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Delivery times</h2>
            <div className="space-y-3">
              {[
                { key: 'morning', label: 'Morning', timeKey: 'morning_time', enabledKey: 'morning_enabled' },
                { key: 'midday', label: 'Midday', timeKey: 'midday_time', enabledKey: 'midday_enabled' },
                { key: 'evening', label: 'Evening', timeKey: 'evening_time', enabledKey: 'evening_enabled' },
              ].map(slot => (
                <div
                  key={slot.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    prefs[slot.enabledKey]
                      ? 'bg-card border-border'
                      : 'bg-muted/30 border-border/50 opacity-60'
                  }`}
                >
                  <Checkbox
                    checked={prefs[slot.enabledKey]}
                    onCheckedChange={v => setPrefs(prev => ({ ...prev, [slot.enabledKey]: v }))}
                  />
                  <Label className="text-sm font-medium text-foreground flex-1">{slot.label}</Label>
                  <button
                    type="button"
                    disabled={!prefs[slot.enabledKey]}
                    onClick={() => setShowTimeDropdown(showTimeDropdown === slot.key ? null : slot.key)}
                    className="w-28 h-10 px-3 rounded-md border border-input bg-card text-foreground text-sm text-left disabled:opacity-50"
                  >
                    {formatTimeLabel(prefs[slot.timeKey])}
                  </button>
                  {showTimeDropdown === slot.key && (
                    <div className="fixed inset-0 z-50" onClick={() => setShowTimeDropdown(null)}>
                      <div className="absolute right-0 top-full mt-1 max-h-60 overflow-y-auto w-28 rounded-md border border-input bg-popover shadow-lg" onClick={e => e.stopPropagation()}>
                        {generateTimeSlots(slot.key).map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setPrefs(prev => ({ ...prev, [slot.timeKey]: opt.value }));
                              setShowTimeDropdown(null);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${prefs[slot.timeKey] === opt.value ? 'bg-primary/10 font-medium' : ''}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Appearance */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Dark mode</Label>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={v => setTheme(v ? 'dark' : 'light')}
              />
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Privacy</h2>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="flex-1 mr-4">
                <p className="text-sm font-medium text-foreground">Analytics &amp; personalization</p>
                <p className="text-xs text-muted-foreground mt-0.5">Helps us improve. Turn off anytime.</p>
              </div>
              <Switch
                checked={prefs.analytics_consent}
                onCheckedChange={v => setPrefs(prev => ({ ...prev, analytics_consent: v }))}
              />
            </div>
          </section>

          {/* Subscription */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Subscription</h2>
            <div className="bg-card border border-border rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Mobile subscriptions</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Premium subscriptions are planned for future mobile apps. Purchases and billing management are not available on the web preview.
                </p>
              </div>
            </div>
          </section>

          {/* Export */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Data</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportEntries}
              disabled={exporting}
              className="w-full justify-center"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              {exporting ? 'Exporting...' : 'Export all entries'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Download your entries as a JSON file.</p>
          </section>

          {/* Subscription & Account */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Subscription & Account</h2>

            {/* Subscription cancel info */}
            <div className="bg-muted/50 border border-border rounded-xl p-4 mb-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Cancel your subscription</p>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>When mobile subscriptions are available, iOS purchases will be managed in the App Store and Android purchases in Google Play.</p>
                <p className="italic">Web subscription management is not available.</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <p className="text-sm"><span className="text-muted-foreground">Name:</span> {user?.full_name}</p>
              <p className="text-sm"><span className="text-muted-foreground">Email:</span> {user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-destructive hover:text-destructive"
              onClick={() => base44.auth.logout()}
            >
              Log out
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Need to close your account?{' '}
              <a className="underline text-primary" href="mailto:perkupdaily@gmail.com?subject=Account%20closure%20request">
                Email support
              </a>{' '}
              so we can verify your request safely.
            </p>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Support</h2>
            <a href="/support" target="_blank" rel="noopener noreferrer" className="block">
              <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <LifeBuoy className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Get Support</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Questions, feedback, or need help with the app?</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
            </a>
          </section>

          {/* Bug report / feature request */}
          <BugReportSection user={user} />

          {/* Legal links */}
          <div className="pt-4">
            <LegalLinks />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
              {validationError}
            </div>
          )}

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2" />
            ) : null}
            {saved ? 'Saved!' : 'Save settings'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}