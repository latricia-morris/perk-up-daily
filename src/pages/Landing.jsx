import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Sparkles, Shield, Heart, ArrowRight, Star, BookOpen, Zap, ChevronDown, ChevronUp, Trophy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScienceMatrix from '@/components/landing/ScienceMatrix';

// ── Hero card preview ──────────────────────────────────────────────────────
function HeroCards() {
  const [christianOn, setChristianOn] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setChristianOn((v) => !v), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto lg:mx-0">
      <div className="rounded-2xl p-5 shadow-md relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #fde8c0 0%, #fffdf8 60%)',
        border: '1px solid #f5d680'
      }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle, rgba(212,131,10,0.15) 0%, transparent 70%)'
        }} />
        <div className="flex items-center gap-1.5 mb-3">
          <Zap className="w-3 h-3" style={{ color: '#E8A838' }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#E8A838' }}>Affirmation</span>
        </div>
        <p className="font-display text-sm italic leading-relaxed" style={{ color: '#2c1e0f' }}>
          "I am building something that will outlast this moment. My work matters."
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.07)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3 h-3 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Memory</span>
          </div>
          <p className="font-display text-xs italic leading-relaxed" style={{ color: '#2c1e0f' }}>
            "Hit 500 subscribers. From zero."
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.07)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Heart className="w-3 h-3 text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Blessing</span>
          </div>
          <p className="font-display text-xs italic leading-relaxed" style={{ color: '#2c1e0f' }}>
            "My kids still run to hug me at the door."
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pt-1">
        <span className="text-xs font-medium" style={{ color: '#7a5c3a' }}>Faith-Based Content</span>
        <button
          onClick={() => setChristianOn((v) => !v)}
          className="relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none"
          style={{ background: christianOn ? '#E8A838' : '#d6c9b5' }}
          aria-label="Toggle Christian content">
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300"
            style={{ transform: christianOn ? 'translateX(20px)' : 'translateX(0px)' }} />
        </button>
        <span className="text-xs" style={{ color: christianOn ? '#E8A838' : '#c4a882' }}>
          {christianOn ? 'On' : 'Off'}
        </span>
      </div>

      <div
        className="rounded-2xl p-5 shadow-md"
        style={{
          background: 'linear-gradient(135deg, #e8f4fd 0%, #fffdf8 60%)',
          border: '1px solid #bde0f5',
          opacity: christianOn ? 1 : 0,
          visibility: christianOn ? 'visible' : 'hidden',
          transition: 'opacity 0.35s ease, visibility 0.35s ease',
          pointerEvents: christianOn ? 'auto' : 'none'
        }}>
        <div className="flex items-center gap-1.5 mb-3">
          <BookOpen className="w-3 h-3 text-sky-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Scripture</span>
        </div>
        <p className="font-display text-sm italic leading-relaxed" style={{ color: '#2c1e0f' }}>
          "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you."
        </p>
        <p className="text-xs mt-2" style={{ color: '#7a5c3a' }}>Jeremiah 29:11</p>
      </div>
    </div>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'What is Perk Up Daily?', a: 'It is a daily encouragement app that helps you log the good things in your life and resurfaces them throughout your day at morning, midday, and in the evening. Think of it as an easy add positivity practice that brings compounding joy.' },
  { q: 'Is this a faith-based app?', a: 'It is faith-friendly. You can turn Christian content on or off in your settings. With it on, you get scriptures and the Deep Faith category. With it off, the app works beautifully without any religious content. You are in complete control.' },
  { q: 'Can I add my own content?', a: 'Yes, and that is the heart of the app. You can log your own memories, wins, blessings, milestones, affirmations, quotes, and personal notes. The more you add, the more personal your daily deliveries become.' },
  { q: 'What happens after my free trial?', a: 'After 7 days your subscription begins at $7.99 per month. As a founding member, you lock in $4.99 per month for as long as you maintain your subscription. You will receive a reminder before you are charged, and you can cancel at any time directly from your account settings.' },
  { q: 'How is this different from a journal app?', a: 'A journal captures your thoughts. Perk Up Daily brings them back to you. You do not have to dig through old entries to find something meaningful. The app surfaces the right thing at the right time.' },
  { q: 'Can I cancel anytime?', a: 'Yes, with one tap and no questions asked.' }
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(44,30,15,0.1)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="text-sm font-semibold" style={{ color: '#2c1e0f' }}>{q}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: '#d4830a' }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#c4a882' }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden">
            <p className="pb-4 text-sm leading-relaxed" style={{ color: '#7a5c3a' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── CTA helper ─────────────────────────────────────────────────────────────
function CtaBlock() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Link to="/onboarding">
        <Button size="lg" className="text-base px-8" style={{ background: '#E8A838', color: '#fef9f2' }}>
          Start your free 7-day trial <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
      <p className="text-sm" style={{ color: '#c4a882' }}>7 days free, then $7.99/month. Founding members lock in $4.99/month. Cancel anytime.</p>
    </div>
  );
}

// ── Reset Center preview ───────────────────────────────────────────────────
const RESET_PREVIEW = [
  { emoji: '🧠', label: 'Chill', desc: 'Settle your nervous system' },
  { emoji: '🎯', label: 'Focus', desc: 'Sharpen your attention' },
  { emoji: '☀️', label: 'Smile', desc: 'Soften and find comfort' },
  { emoji: '⚡', label: 'Energize', desc: 'Invigorate and wake up' },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{
      background: '#fef9f2',
      backgroundImage: 'radial-gradient(ellipse 90% 55% at 65% 18%, rgba(255,243,210,0.92) 0%, rgba(253,232,175,0.28) 52%, transparent 78%), radial-gradient(ellipse 55% 40% at 8% 72%, rgba(255,236,170,0.38) 0%, transparent 70%)'
    }}>

      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(254,249,242,0.72)', borderBottom: '1px solid rgba(44,30,15,0.07)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="https://media.base44.com/images/public/6a312911bcddb0806c388af8/ad5333c2c_PerkUpKingfisher.png" alt="Perk Up Daily" className="w-8 h-8 object-contain" />
            <h1 className="text-lg font-semibold [font-family:'Montserrat',_sans-serif] px-1 text-[#4b351b] uppercase tracking-[0.18rem]" style={{ color: '#2c1e0f' }}>Perk Up Daily</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm" className="text-sm" style={{ color: '#7a5c3a' }}>Log in</Button></Link>
            <Link to="/onboarding"><Button size="sm" className="text-sm" style={{ background: '#E8A838', color: '#fef9f2' }}>Get Started</Button></Link>
          </div>
        </div>
      </header>

      {/* ── 1. HERO ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-6 md:pt-24 md:pb-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 max-w-xl">
            <p className="font-semibold text-sm mb-4" style={{ color: '#E8A838' }}>Your daily dose of good</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight" style={{ color: '#2c1e0f' }}>
              Backed by Science. Powered by Positivity.
            </h2>
            <p className="text-lg mt-5 leading-relaxed" style={{ color: '#7a5c3a' }}>
              Capture the good stuff. Let it find you again. Perk Up Daily gently resurfaces your best memories, wins, and moments of faith throughout your day—right when you need them most.
            </p>
            <div className="flex flex-col items-start gap-2 mt-7">
              <Link to="/onboarding">
                <Button size="lg" className="text-base px-8" style={{ background: '#E8A838', color: '#fef9f2' }}>
                  Start your free 7-day trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full lg:w-96 shrink-0">
            <HeroCards />
          </motion.div>
        </div>
      </section>

      {/* ── 2. SOCIAL PROOF ──────────────────────────────────────────── */}
      <section className="pt-6 pb-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-center mb-2" style={{ color: '#2c1e0f' }}>
            People coming alive
          </h3>
          <p className="text-center mb-10 max-w-md mx-auto text-sm" style={{ color: '#7a5c3a' }}>
            Early reactions from people who got their hands on it first.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { text: 'This is exactly what I needed and did not know I was missing.', name: 'Sarah K.' },
              { text: 'I opened it on a hard morning and my own words came back to me. That was everything.', name: 'Marcus D.' },
              { text: 'Finally an app that keeps things positive without being cheesy.', name: 'Jenna T.' }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl p-6"
                style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.07)', boxShadow: '0 1px 4px rgba(44,30,15,0.06)' }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#2c1e0f' }}>"{t.text}"</p>
                <p className="text-xs font-medium" style={{ color: '#c4a882' }}>{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FOUNDER'S STORY ───────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-semibold mb-3 text-xl" style={{ color: '#E8A838' }}>Why I built this</p>
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-6" style={{ color: '#2c1e0f' }}>
            I spent decades in the dark. Then I learned the brain can change.
          </h3>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#4a3520' }}>
            <p>Depression has a way of making you believe that how you feel right now is just how life is. There is a nagging voice that says "you'll always be this way." It argues the good moments as flukes and reinforces the hard ones as your truth.</p>
            <p>I lost decades of my life to that lie.</p>
            <p>What changed for me was not a single breakthrough moment. It was the repeated intentional decisions to stop feeding the darkness and start collecting evidence of the light.</p>
            <p>As worthless as I felt, I would too readily discard how blessed I really am and how much I have actually accomplished and experienced.</p>
            <p>It is easy to forget the cool things you have accomplished, the blessings you have watched unfold, victories, life wins, and the many things that make life good.</p>
            <p>The path back was not found in substances or self-help books. It was in learning the art of reframing, refocusing and remembering the many reasons we have to smile.</p>
            <p>I created Perk Up Daily because sometimes you just need to be reminded of how awesome you really are and of the people, places, and experiences that make your life special.</p>
            <p>The future is bright. It is time to Perk Up.</p>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold" style={{ color: '#2c1e0f' }}>LaTricia Morris, Founder</p>
            <p className="text-xs" style={{ color: '#7a5c3a' }}>The Brand Revivalist® and owner of Ox &amp; Iron, LLC</p>
          </div>

          <div className="mt-6 flex justify-center">
            <img
              src="https://media.base44.com/images/public/6a312911bcddb0806c388af8/8873b56bc_DSC_2093sunny.png"
              alt="LaTricia Morris, Founder"
              className="w-72 md:w-80 object-contain" />
          </div>

          {/* Scripture pullout */}
          <div className="mt-10 rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #e8f4fd 0%, #fffdf8 70%)', border: '1px solid #bde0f5' }}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Scripture</span>
            </div>
            <p className="font-display text-base italic leading-relaxed" style={{ color: '#2c1e0f' }}>
              "Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable, if anything is excellent or praiseworthy, think about such things."
            </p>
            <p className="text-sm mt-3 font-medium" style={{ color: '#7a5c3a' }}>Philippians 4:8</p>
          </div>
        </div>
      </section>

      {/* ── 4. RESET CENTER ─────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: '#2c1e0f' }}>
            Need an immediate reset?
          </h3>
          <p className="text-sm leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: '#7a5c3a' }}>
            When stress hits or your mind starts spinning, don't just passively scroll. Tap what you need right now to launch a quick, interactive exercise built to shift your state in under two minutes.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RESET_PREVIEW.map((opt, i) => (
              <motion.div
                key={opt.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="rounded-2xl p-5 text-center"
                style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.08)' }}>
                <div className="text-2xl mb-2">{opt.emoji}</div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: '#2c1e0f' }}>{opt.label}</div>
                <div className="text-xs" style={{ color: '#7a5c3a' }}>{opt.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. WHAT YOU GET ──────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-center mb-3" style={{ color: '#2c1e0f' }}>
            How Perk Up picks you up.
          </h3>
          <p className="text-center mb-10 max-w-lg mx-auto text-sm" style={{ color: '#7a5c3a' }}>
            This is not a journal and it is not a habit tracker. It is something built entirely around bringing your best self back to you throughout your day.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Sun, title: 'Three daily deliveries', desc: 'You receive fresh words of encouragement in the morning and again at midday, blending your own entries with our pre-installed Perk Ups. In the evening, you get a gentle prompt to reflect on your day and log something good.' },
              { icon: Sparkles, title: 'Log your own Happy Entries', desc: 'You can add your own memories, blessings, wins, milestones, affirmations, favorite bible verses and personal notes. The more you add, the more personal your daily deliveries become.' },
              { icon: BookOpen, title: 'Faith-friendly content', desc: 'If faith is part of your life, you can turn on Faith-based content to receive Bible verses and access the Deep Faith category whenever you want it. If not, you are still welcome to enjoy the uplifting experience our app provides.' },
              { icon: Trophy, title: 'Milestone timeline', desc: 'You get a dedicated view of how far you have come, organized by life area including Rich Relationships, Legacy Business, Financial Freedom, and more.' },
              { icon: Share2, title: 'Share to social', desc: 'You can share any card as a branded graphic directly to Instagram, Facebook, or anywhere else. Join us in becoming a crazy joy spreader, uplifting those around you.' },
              { icon: Shield, title: 'No negativity. Ever.', desc: 'The app gently flags entries that could bring you down and asks whether that is really what you want coming back to you on a hard morning.' }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="rounded-2xl p-6"
                style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.08)', boxShadow: '0 1px 4px rgba(44,30,15,0.06)' }}>
                <f.icon className="w-5 h-5 mb-4" style={{ color: '#d4830a' }} />
                <h4 className="font-display text-base font-semibold mb-2" style={{ color: '#2c1e0f' }}>{f.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#7a5c3a' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CORE APP VALUES ──────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}>
              <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#2c1e0f' }}>
                Upgrade Your Identity
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#7a5c3a' }}>
                Who will you choose to be? Track your identity shifts, add tags, and input custom photos so your mind stays anchored to your growth, not your stress.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}>
              <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#2c1e0f' }}>
                Set Your Own Daily Rhythm
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#7a5c3a' }}>
                Toggle faith-based content on or off instantly. Build a custom feed of blessings, life wins, and micro-stories that belong entirely to you.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 7. MILESTONE REVEAL ─────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: '#2c1e0f' }}>
            Turn Stepping Stones into Milestones
          </h3>
          <p className="text-sm leading-relaxed max-w-lg mx-auto" style={{ color: '#7a5c3a' }}>
            Your goals shouldn't live in a buried text note. Interact with your milestones in real time, check off tracking updates, and actively watch your momentum stack up day by day.
          </p>
        </div>
      </section>

      {/* ── 8. SCIENCE MATRIX ───────────────────────────────────────── */}
      <ScienceMatrix />

      {/* ── 9. PRICING & RISK REVERSAL ──────────────────────────────── */}
      <section className="py-12 md:py-16" id="pricing">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: '#2c1e0f' }}>
            Start training your brain today.
          </h3>
          <p className="text-sm mb-10 max-w-lg mx-auto" style={{ color: '#7a5c3a' }}>
            Simple, premium mental fitness. Completely free of tracking cookies and predatory ad networks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Founding Member */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: 'linear-gradient(135deg, #fde8c0 0%, #fffdf8 70%)', border: '2px solid #E8A838', boxShadow: '0 4px 20px rgba(232,168,56,0.12)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#E8A838' }}>Founding Member</p>
              <div className="flex items-baseline justify-center gap-1 mb-3">
                <span className="text-4xl font-display font-bold" style={{ color: '#E8A838' }}>$4.99</span>
                <span className="text-sm" style={{ color: '#7a5c3a' }}>/month</span>
              </div>
              <p className="text-sm mb-6" style={{ color: '#4a3520' }}>
                Lock in this special introductory rate for the lifetime of your account.
              </p>
              <Link to="/onboarding" className="mt-auto">
                <Button className="w-full text-base" style={{ background: '#E8A838', color: '#fef9f2' }}>
                  Claim Founding Rate
                </Button>
              </Link>
            </motion.div>

            {/* Standard Access */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.1)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#7a5c3a' }}>Standard Access</p>
              <div className="flex items-baseline justify-center gap-1 mb-3">
                <span className="text-4xl font-display font-bold" style={{ color: '#2c1e0f' }}>$7.99</span>
                <span className="text-sm" style={{ color: '#7a5c3a' }}>/month</span>
              </div>
              <p className="text-sm mb-6" style={{ color: '#4a3520' }}>
                Full unrestricted access to all modules, library tools, and future resets.
              </p>
              <Link to="/onboarding" className="mt-auto">
                <Button variant="outline" className="w-full text-base border-input">
                  Start Standard Plan
                </Button>
              </Link>
            </motion.div>
          </div>

          <p className="text-xs mt-6" style={{ color: '#c4a882' }}>
            All accounts include a 100% risk-free 7-day trial. Cancel instantly with one tap inside your settings.
          </p>

          {/* App Store badges */}
          <div className="flex flex-col items-center gap-3 mt-8">
            <p className="text-sm font-semibold" style={{ color: '#7a5c3a' }}>Coming soon to the App Store &amp; Google Play</p>
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: '#2c1e0f' }}>
                <svg className="w-5 h-5" viewBox="0 0 384 512" fill="white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 37 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.6 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-92.9zM241.5 68.9C267.6 40.7 265.3 13.5 264.6 3.7c-23.9 1.4-51.6 16.4-67.3 34.9-17.5 19.8-27.9 44.3-25.6 71.9 26.2 2 50.2-11.5 69.8-31.6z"/></svg>
                <div className="text-left">
                  <p className="text-[9px] leading-tight text-white/70">Download on the</p>
                  <p className="text-sm font-semibold leading-tight text-white">App Store</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: '#2c1e0f' }}>
                <svg className="w-5 h-5" viewBox="0 0 512 512" fill="white"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                <div className="text-left">
                  <p className="text-[9px] leading-tight text-white/70">Get it on</p>
                  <p className="text-sm font-semibold leading-tight text-white">Google Play</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <CtaBlock />
          </div>
        </div>
      </section>

      {/* ── 10. GUARANTEE ───────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl px-8 md:px-12 py-12 md:py-16" style={{ background: '#332D29' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold mb-6" style={{ color: '#fde8c0' }}>
                  Possible side effects may include
                </h3>
                <ul className="space-y-3 mb-6">
                  {[
                    'Feeling more energized when you wake up',
                    'Remembering the good things you usually rush past',
                    'Feeling more hopeful about your day',
                    'Noticing your own progress more often',
                    'Feeling encouraged to keep going',
                    'Becoming more aware of the wins, blessings, and beauty already in your life'
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm" style={{ color: '#e8dcc8' }}>
                      <span style={{ color: '#E8A838' }} className="shrink-0 font-semibold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs" style={{ color: '#b8a889' }}>
                  Results may vary, but the future is bright. It is time to Perk Up.
                </p>
              </div>
              <div className="flex flex-col justify-start">
                <h3 className="font-display text-2xl md:text-3xl font-semibold mb-4" style={{ color: '#E8A838' }}>
                  No risk. All rewards.
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#e8dcc8' }}>
                  Try Perk Up Daily free for 7 days. If it does not make a meaningful difference in how you move through your day, cancel with one tap before the trial ends and you will not be charged. No hassle. No pressure. Just a chance to see what happens when the good starts finding you again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. FAQ ─────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-6" style={{ color: '#2c1e0f' }}>
            Common questions
          </h3>
          <div>
            {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ── 12. FINAL CTA ───────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: '#2c1e0f' }}>
            Ready to start your day differently?
          </h3>
          <p className="text-sm mb-8" style={{ color: '#7a5c3a' }}>
            Your best moments are waiting to revisit you again.
          </p>
          <CtaBlock />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ borderTop: '1px solid rgba(44,30,15,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#c4a882' }}>2026 Perk Up Daily. All rights reserved.</p>
          <div className="flex gap-6 text-sm" style={{ color: '#c4a882' }}>
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
            <Link to="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <a href="mailto:perkupdaily@gmail.com" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}