import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScienceMatrix from '@/components/landing/ScienceMatrix';

const IMG = {
  hero: 'https://media.base44.com/images/public/6a312911bcddb0806c388af8/1ad7c1fa6_soloiphonetilt.png',
  founder: 'https://media.base44.com/images/public/6a312911bcddb0806c388af8/8873b56bc_DSC_2093sunny.png',
  trio: 'https://media.base44.com/images/public/6a312911bcddb0806c388af8/82c22f4e6_iphonetrio.png',
  cascade: 'https://media.base44.com/images/public/6a312911bcddb0806c388af8/8cdac8891_iphonecascade.png',
  duo: 'https://media.base44.com/images/public/6a312911bcddb0806c388af8/99c54dd47_iphoneduo.png',
  visions: 'https://media.base44.com/images/public/6a312911bcddb0806c388af8/4370f9e3f_iphoneisions.png',
  logo: 'https://media.base44.com/images/public/6a312911bcddb0806c388af8/ad5333c2c_PerkUpKingfisher.png',
};

const RESET_PILLS = ['CHILL', 'FOCUS', 'SMILE', 'ENERGIZE'];

const SIDE_EFFECTS = [
  'Finding yourself smiling for no reason at all',
  'Remembering how incredibly loved you actually are',
  "Realizing your value isn't tied to your productivity",
  'Waking up with a peaceful, clear mind',
  'Breaking free from the toxic habit of comparison',
  'Experiencing moments of deep, unshakeable gratitude',
];

const CREAM = '#fffdf9';
const WHITE = '#ffffff';
const DARK = '#1a1a1a';
const INK = '#2c1e0f';
const MUTE = '#7a5c3a';
const GOLD = '#E6B800';

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: CREAM }}>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(255,253,249,0.82)', borderBottom: '1px solid rgba(44,30,15,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={IMG.logo} alt="Perk Up Daily" className="w-8 h-8 object-contain" />
            <span className="text-base font-semibold uppercase tracking-[0.18rem]" style={{ color: INK, fontFamily: "'Montserrat', sans-serif" }}>Perk Up Daily</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm" style={{ color: MUTE }}>Log in</Button></Link>
            <Link to="/onboarding"><Button size="sm" style={{ background: GOLD, color: '#fff' }}>Get Started</Button></Link>
          </div>
        </div>
      </header>

      {/* ── 1. HERO ────────────────────────────────────────────────── */}
      <section style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 max-w-xl">
              <p className="text-sm font-semibold mb-3" style={{ color: GOLD }}>Backed by Science. Powered by Positivity.</p>
              <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-4" style={{ color: INK }}>
                Capture the good stuff. Let it find you again.
              </h1>
              <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: MUTE }}>
                Perk Up Daily gently resurfaces your best memories, victories, and moments of faith throughout your day—right when you need them most.
              </p>
              <a href="#pricing">
                <Button size="lg" className="text-base px-8" style={{ background: GOLD, color: '#fff' }}>
                  Claim Founding Membership <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
            <div className="w-full max-w-sm">
              <motion.img
                src={IMG.hero}
                alt="Perk Up Daily App Display"
                className="w-full"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FOUNDER'S STORY ─────────────────────────────────────── */}
      <section id="story" style={{ background: WHITE }}>
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="lg:w-2/3 lg:pr-8">
              <p className="text-sm font-semibold mb-2" style={{ color: GOLD }}>Why I Built This</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold leading-tight mb-5" style={{ color: INK }}>
                I spent decades in the dark. Then I learned the brain can change.
              </h2>
              <div className="space-y-4 text-sm md:text-base leading-relaxed" style={{ color: '#4a3520' }}>
                <p>I spent years feeling like my mind was constantly stuck on a loop of stress and survival mode. That's when I discovered the reality of neuroplasticity—the beautiful scientific fact that our brains aren't fixed. We can actually retrain our default paths.</p>
                <p>But knowing the science wasn't enough. I needed a practical, beautiful space to actually install the good things throughout my busy days. When I couldn't find an app that treated my victories, blessings, and moments of faith with the dignity they deserved, I decided to build it myself.</p>
                <p>Perk Up Daily is the result of that journey. It's a space designed to help you break free from passive scrolling, step out of the dark, and actively program your mind to notice the light.</p>
                <p className="font-semibold" style={{ color: INK }}>— LaTricia, Founder</p>
              </div>
            </div>
            <div className="lg:w-1/3">
              <img
                src={IMG.founder}
                alt="LaTricia, Founder of Perk Up Daily"
                className="w-56 h-56 md:w-72 md:h-72 object-cover rounded-full mx-auto"
                style={{ border: `3px solid ${GOLD}`, boxShadow: '0 4px 20px rgba(44,30,15,0.08)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. RESET HUB ────────────────────────────────────────────── */}
      <section style={{ background: CREAM }}>
        <div className="max-w-3xl mx-auto px-6 py-10 md:py-14 text-center">
          <p className="text-sm font-semibold mb-2" style={{ color: GOLD }}>State Regulation Center</p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: INK }}>
            Need an immediate reset?
          </h2>
          <p className="text-sm md:text-base leading-relaxed mb-6 max-w-lg mx-auto" style={{ color: MUTE }}>
            When stress hits or your mind starts spinning, take immediate control. Select your target state to clear structural loops in under two minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {RESET_PILLS.map(pill => (
              <a
                key={pill}
                href="#pricing"
                className="px-6 py-3 rounded-full text-xs font-semibold tracking-widest transition-all hover:translate-y-[-2px]"
                style={{ border: '1px solid rgba(44,30,15,0.15)', color: INK }}
                onMouseEnter={e => { e.currentTarget.style.background = INK; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = INK; }}
              >
                {pill}
              </a>
            ))}
          </div>
          <img
            src={IMG.trio}
            alt="Perk Up Daily Interactive Reset Interface"
            className="w-full max-w-2xl mx-auto"
            style={{ filter: 'drop-shadow(0px 25px 45px rgba(26,26,26,0.06))' }}
          />
        </div>
      </section>

      {/* ── 4. CORE MODULES ────────────────────────────────────────── */}
      <section style={{ background: WHITE }}>
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">

          {/* Row A: Image left, text right */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-10 md:mb-14">
            <div className="md:w-1/2">
              <img src={IMG.cascade} alt="Identity Upgrades View" className="w-full max-w-sm mx-auto" style={{ filter: 'drop-shadow(0px 30px 50px rgba(26,26,26,0.08))' }} />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: MUTE }}>Top-Down Consolidation</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: INK }}>Upgrade Your Identity</h2>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: MUTE }}>
                Who will you choose to be? Track your core mental shifts, tag your breakthroughs, and attach memory-jogger photos directly into your stream so your mind stays anchored to your growth path rather than default stress scripts.
              </p>
            </div>
          </div>

          {/* Row B: Text left, image right */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12">
            <div className="md:w-1/2">
              <img src={IMG.duo} alt="Daily Rhythm Engine" className="w-full max-w-sm mx-auto" style={{ filter: 'drop-shadow(0px 30px 50px rgba(26,26,26,0.08))' }} />
            </div>
            <div className="md:w-1/2 md:pr-8">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: MUTE }}>Custom Data Filtering</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: INK }}>Set Your Own Daily Rhythm</h2>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: MUTE }}>
                Toggle faith-based content on or off completely dynamically. Build a highly curated private archive of blessings, life victories, and personalized micro-stories that belong entirely to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. MILESTONE REVEAL ─────────────────────────────────────── */}
      <section style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2">
              <img src={IMG.visions} alt="Interactive Milestone Overlays" className="w-full max-w-sm mx-auto" style={{ filter: 'drop-shadow(0px 30px 50px rgba(26,26,26,0.08))' }} />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: MUTE }}>Dopaminergic Pacing</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: INK }}>Turn Stepping Stones into Milestones</h2>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: MUTE }}>
                Your goals shouldn't sit hidden in a buried text note. Interact with your milestones via live UI tracking states, update completion stages instantly, and auto-populate your personal photos directly onto custom-branded graphics ready to share.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. SCIENCE MATRIX ──────────────────────────────────────── */}
      <ScienceMatrix />

      {/* ── 7. PRICING ─────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: CREAM }}>
        <div className="max-w-3xl mx-auto px-6 py-10 md:py-14 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold mb-2" style={{ color: INK }}>
            Start training your brain today.
          </h2>
          <p className="text-sm md:text-base mb-8 max-w-lg mx-auto" style={{ color: MUTE }}>
            Simple, clean packaging. Premium access built entirely free of predatory tracking configurations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Founding Member */}
            <div className="rounded-2xl p-6 md:p-8 flex flex-col text-left" style={{ background: WHITE, border: `2px solid ${GOLD}`, boxShadow: '0px 20px 40px rgba(230,184,0,0.05)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: GOLD }}>Founding Member</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-display font-bold" style={{ color: INK }}>$4.99</span>
                <span className="text-sm" style={{ color: MUTE }}>/ mo</span>
              </div>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#4a3520' }}>
                Lock in this exact introductory pricing layer for the lifetime of your platform profile.
              </p>
              <Link to="/onboarding" className="mt-auto">
                <Button className="w-full text-base" style={{ background: GOLD, color: '#fff' }}>Secure Founding Status</Button>
              </Link>
            </div>

            {/* Standard Access */}
            <div className="rounded-2xl p-6 md:p-8 flex flex-col text-left" style={{ background: WHITE, border: '1px solid #EAE9E2' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: MUTE }}>Standard Access</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-display font-bold" style={{ color: INK }}>$7.99</span>
                <span className="text-sm" style={{ color: MUTE }}>/ mo</span>
              </div>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: '#4a3520' }}>
                Complete access across all library modules, updates, and future state tools.
              </p>
              <Link to="/onboarding" className="mt-auto">
                <Button variant="outline" className="w-full text-base">Start Standard Plan</Button>
              </Link>
            </div>
          </div>

          <p className="text-xs mt-6" style={{ color: '#908F8A' }}>
            All premium memberships begin with an unrestricted 7-day trial period. Cancel via a single tap inside system profiles.
          </p>
        </div>
      </section>

      {/* ── 8. SIDE EFFECTS & RISK ─────────────────────────────────── */}
      <section style={{ background: DARK }}>
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="md:pr-8">
              <h3 className="font-display text-xl md:text-2xl font-semibold mb-5" style={{ color: '#fde8c0' }}>
                Possible side effects may include:
              </h3>
              <ul className="space-y-3">
                {SIDE_EFFECTS.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm" style={{ color: '#e8dcc8' }}>
                    <span style={{ color: GOLD }} className="shrink-0 font-semibold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:pl-8">
              <h3 className="font-display text-xl md:text-2xl font-semibold mb-4" style={{ color: GOLD }}>
                No risk. All rewards.
              </h3>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: '#e8dcc8' }}>
                Try Perk Up Daily free for 7 days. If your mind doesn't feel lighter, your focus sharper, and your heart more anchored, cancel with a single tap inside your settings. Your peace belongs entirely to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="py-8" style={{ borderTop: '1px solid rgba(44,30,15,0.08)', background: CREAM }}>
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs italic leading-relaxed max-w-2xl mx-auto text-center mb-6" style={{ color: '#908F8A' }}>
            Disclaimer: Perk Up Daily offers educational utilities and interactive tools for cognitive pacing and neuro-somatic regulation. This software does not provide clinical diagnoses, medical therapy, or neurological treatment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: '#c4a882' }}>2026 Perk Up Daily. All rights reserved.</p>
            <div className="flex gap-6 text-sm" style={{ color: '#c4a882' }}>
              <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
              <Link to="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <a href="mailto:perkupdaily@gmail.com" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}