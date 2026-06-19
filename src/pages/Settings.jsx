import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, Loader2, Trash2, Download } from 'lucide-react';
import { MobileSelect } from '@/components/ui/mobile-select';
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
   morning_time: '07:00',
   midday_time: '12:00',
   evening_time: '19:00',
   delivery_method: 'email',
   phone_number: '',
   country_code: 'US',
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
         morning_time: u.morning_time || '07:00',
         midday_time: u.midday_time || '12:00',
         evening_time: u.evening_time || '19:00',
         delivery_method: u.delivery_method || 'email',
         phone_number: u.phone_number || '',
         country_code: u.country_code || 'US',
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

          {/* Delivery Method */}
           <section>
             <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Delivery method</h2>
             <div className="space-y-3">
               {[
                 { label: 'Email', value: 'email' },
                 { label: 'Text (SMS)', value: 'sms' },
                 { label: 'None', value: 'none' },
               ].map(opt => (
                 <button
                   key={opt.value}
                   onClick={() => setPrefs(prev => ({ ...prev, delivery_method: opt.value }))}
                   className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                     prefs.delivery_method === opt.value
                       ? 'bg-primary/10 border-primary/40'
                       : 'bg-card border-border hover:border-primary/30'
                   }`}
                 >
                   <p className="font-medium text-foreground">{opt.label}</p>
                 </button>
               ))}
             </div>
           </section>

           {/* Phone Number (if SMS selected) */}
           {prefs.delivery_method === 'sms' && (
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
               </div>
             </section>
           )}

          {/* Delivery Times */}
           <section>
             <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Delivery times</h2>
             <div className="space-y-4">
               <div className="grid grid-cols-3 gap-3">
                 <div>
                   <Label className="text-xs text-muted-foreground mb-1 block">Morning</Label>
                   <Input type="time" value={prefs.morning_time} onChange={e => setPrefs(prev => ({ ...prev, morning_time: e.target.value }))} />
                 </div>
                 <div>
                   <Label className="text-xs text-muted-foreground mb-1 block">Midday</Label>
                   <Input type="time" value={prefs.midday_time} onChange={e => setPrefs(prev => ({ ...prev, midday_time: e.target.value }))} />
                 </div>
                 <div>
                   <Label className="text-xs text-muted-foreground mb-1 block">Evening</Label>
                   <Input type="time" value={prefs.evening_time} onChange={e => setPrefs(prev => ({ ...prev, evening_time: e.target.value }))} />
                 </div>
               </div>
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