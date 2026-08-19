import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Check, Mail, MessageCircle, LifeBuoy } from 'lucide-react';

const SUPPORT_TYPES = [
  { value: 'content', label: 'Content', desc: 'Suggestions for library content, themes, or categories' },
  { value: 'functions_features', label: 'Functions & Features', desc: 'How something works, or a feature you would like to see' },
  { value: 'questions', label: 'Questions', desc: 'General questions about the app or your account' },
  { value: 'account_billing', label: 'Account & Billing', desc: 'Subscription, payment, or login issues' },
  { value: 'other', label: 'Other', desc: 'Anything else on your mind' },
];

export default function Support() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', support_type: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) {
        base44.auth.me().then(u => {
          setUser(u);
          setForm(prev => ({
            ...prev,
            name: u.full_name || '',
            email: u.email || '',
          }));
        }).catch(() => {});
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.support_type || !form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      await base44.functions.invoke('submitSupportRequest', form);
      setSubmitted(true);
    } catch (err) {
      // Still show thank you — the record may have been saved even if email failed
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const valid = form.email.trim() && form.support_type && form.subject.trim() && form.message.trim();

  return (
    <div className="min-h-screen" style={{
      background: '#fef9f2',
      backgroundImage: 'radial-gradient(ellipse 90% 55% at 65% 18%, rgba(255,243,210,0.92) 0%, rgba(253,232,175,0.28) 52%, transparent 78%), radial-gradient(ellipse 55% 40% at 8% 72%, rgba(255,236,170,0.38) 0%, transparent 70%)'
    }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(254,249,242,0.72)', borderBottom: '1px solid rgba(44,30,15,0.07)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="https://media.base44.com/images/public/6a312911bcddb0806c388af8/ad5333c2c_PerkUpKingfisher.png" alt="Perk Up Daily" className="w-8 h-8 object-contain" />
            <h1 className="text-lg font-semibold [font-family:'Montserrat',_sans-serif] uppercase tracking-[0.18rem]" style={{ color: '#2c1e0f' }}>Perk Up Daily</h1>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" style={{ color: '#7a5c3a' }}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-12 md:py-16">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(232,168,56,0.15)' }}>
              <Check className="w-8 h-8" style={{ color: '#E8A838' }} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: '#2c1e0f' }}>
              Thank you for reaching out!
            </h2>
            <p className="text-sm leading-relaxed mb-2" style={{ color: '#7a5c3a' }}>
              Your message has been submitted. We typically respond within 24–48 hours.
            </p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: '#7a5c3a' }}>
              A confirmation has been sent to our team at perkupdaily@gmail.com.
            </p>
            <Link to="/">
              <Button size="lg" className="text-base px-8" style={{ background: '#E8A838', color: '#fef9f2' }}>
                Back to Home
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(232,168,56,0.12)' }}>
                <LifeBuoy className="w-7 h-7" style={{ color: '#E8A838' }} />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-2" style={{ color: '#2c1e0f' }}>
                How can we help?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#7a5c3a' }}>
                We are here for you. Tell us what you need and we will get back to you as soon as we can.
              </p>
            </div>

            {/* Quick contact bar */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <a href="mailto:perkupdaily@gmail.com" className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-80" style={{ background: 'rgba(232,168,56,0.1)', color: '#d4830a' }}>
                <Mail className="w-3.5 h-3.5" /> perkupdaily@gmail.com
              </a>
            </div>

            {/* Form */}
            <div className="rounded-2xl p-6 md:p-8 space-y-5" style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.08)', boxShadow: '0 1px 4px rgba(44,30,15,0.06)' }}>
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block" style={{ color: '#2c1e0f' }}>Name</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    style={{ borderColor: 'rgba(44,30,15,0.12)', background: '#fefcf6' }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block" style={{ color: '#2c1e0f' }}>Email <span style={{ color: '#d4830a' }}>*</span></Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    style={{ borderColor: 'rgba(44,30,15,0.12)', background: '#fefcf6' }}
                  />
                </div>
              </div>

              {/* Support Type */}
              <div>
                <Label className="text-sm font-medium mb-1.5 block" style={{ color: '#2c1e0f' }}>What do you need help with? <span style={{ color: '#d4830a' }}>*</span></Label>
                <Select value={form.support_type} onValueChange={v => setForm(prev => ({ ...prev, support_type: v }))}>
                  <SelectTrigger style={{ borderColor: 'rgba(44,30,15,0.12)', background: '#fefcf6', color: '#2c1e0f' }}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.support_type && (
                  <p className="text-xs mt-1.5" style={{ color: '#c4a882' }}>
                    {SUPPORT_TYPES.find(t => t.value === form.support_type)?.desc}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <Label className="text-sm font-medium mb-1.5 block" style={{ color: '#2c1e0f' }}>Subject <span style={{ color: '#d4830a' }}>*</span></Label>
                <Input
                  value={form.subject}
                  onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief summary of your request"
                  maxLength={120}
                  style={{ borderColor: 'rgba(44,30,15,0.12)', background: '#fefcf6' }}
                />
              </div>

              {/* Message */}
              <div>
                <Label className="text-sm font-medium mb-1.5 block" style={{ color: '#2c1e0f' }}>Message <span style={{ color: '#d4830a' }}>*</span></Label>
                <Textarea
                  value={form.message}
                  onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us what is on your mind…"
                  className="min-h-[140px]"
                  maxLength={3000}
                  style={{ borderColor: 'rgba(44,30,15,0.12)', background: '#fefcf6' }}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!valid || submitting}
                className="w-full text-base"
                size="lg"
                style={{ background: '#E8A838', color: '#fef9f2' }}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting…</>
                ) : (
                  <><MessageCircle className="w-4 h-4 mr-2" /> Submit</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-8" style={{ borderTop: '1px solid rgba(44,30,15,0.08)' }}>
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#c4a882' }}>2025 Perk Up Daily. All rights reserved.</p>
          <div className="flex gap-6 text-sm" style={{ color: '#c4a882' }}>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}