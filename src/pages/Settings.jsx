import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, Loader2, Trash2, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { MobileSelect } from '@/components/ui/mobile-select';
import LegalLinks from '@/components/shared/LegalLinks';
import { CATEGORIES } from '@/lib/constants';
import { useTheme } from '@/lib/useTheme';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
   });
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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await base44.auth.deleteAccount();
      window.location.href = '/';
    } catch (error) {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
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
                <Input
                  type="tel"
                  value={prefs.phone_number}
                  onChange={(e) => setPrefs(prev => ({ ...prev, phone_number: e.target.value.replace(/\D/g, '') }))}
                  placeholder="5551234567"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Enter just the number (no country code needed)</p>
              </div>

              {/* SMS Consent */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={prefs.sms_consent}
                    onCheckedChange={v => setPrefs(prev => ({ ...prev, sms_consent: v }))}
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
                  <div className="pt-1">
                    <LegalLinks />
                  </div>
                </div>
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
                  <Input
                    type="time"
                    value={prefs[slot.timeKey]}
                    onChange={e => setPrefs(prev => ({ ...prev, [slot.timeKey]: e.target.value }))}
                    disabled={!prefs[slot.enabledKey]}
                    className="w-32"
                  />
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

          {/* Subscription */}
          <section>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Subscription</h2>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{user?.subscription_status || 'trial'}</p>
                  <p className="text-xs text-muted-foreground">$4.99/month</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
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
                <p><strong>Purchased on the web:</strong> Use the "Manage" button in the Subscription section above to cancel anytime.</p>
                <p><strong>Purchased on iOS App Store:</strong> Go to Settings → [Your Name] → Subscriptions → Perk Up Daily → Cancel Subscription.</p>
                <p><strong>Purchased on Google Play:</strong> Open Google Play Store → Account → Subscriptions → Perk Up Daily → Cancel Subscription.</p>
                <p className="italic">Deleting your account will not automatically cancel your subscription. Please cancel first if you don't wish to be charged.</p>
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
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete account
            </Button>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Your account and all associated data will be permanently deleted. Make sure you've cancelled your subscription first to avoid being charged.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Delete permanently
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </section>

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