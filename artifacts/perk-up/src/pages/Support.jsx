import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LifeBuoy, Mail } from 'lucide-react';

const SUPPORT_EMAIL = 'perkupdaily@gmail.com';

export default function Support() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: '#fef9f2',
        backgroundImage: 'radial-gradient(ellipse 90% 55% at 65% 18%, rgba(255,243,210,0.92) 0%, rgba(253,232,175,0.28) 52%, transparent 78%), radial-gradient(ellipse 55% 40% at 8% 72%, rgba(255,236,170,0.38) 0%, transparent 70%)',
      }}
    >
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

      <main className="max-w-xl mx-auto px-6 py-16">
        <div className="rounded-2xl p-8 text-center" style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.08)', boxShadow: '0 1px 4px rgba(44,30,15,0.06)' }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(232,168,56,0.12)' }}>
            <LifeBuoy className="w-7 h-7" style={{ color: '#E8A838' }} />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: '#2c1e0f' }}>
            Contact support
          </h2>
          <p className="text-sm leading-relaxed mb-7" style={{ color: '#7a5c3a' }}>
            Send an email to our support team for help with your account, billing, content, or an account-closure request. Your email app will open with the support address filled in.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Perk%20Up%20Daily%20support%20request`}
            className="inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: '#E8A838', color: '#fef9f2' }}
          >
            <Mail className="w-4 h-4 mr-2" /> Email support
          </a>
          <p className="text-xs mt-4" style={{ color: '#c4a882' }}>{SUPPORT_EMAIL}</p>
        </div>
      </main>

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