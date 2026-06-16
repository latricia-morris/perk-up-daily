import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Sparkles, Shield, Heart, ArrowRight, Star, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Sun,
    title: 'Daily Deliveries',
    desc: 'Three moments each day filled with your best memories, affirmations, and encouragement.',
  },
  {
    icon: Sparkles,
    title: 'Personal Vault',
    desc: 'Log blessings, accomplishments, milestones, and moments that matter most to you.',
  },
  {
    icon: Shield,
    title: 'Content You Control',
    desc: 'Choose your categories, toggle Christian content, and curate what surfaces in your day.',
  },
  {
    icon: Heart,
    title: 'Built for Good Days',
    desc: 'No venting. No negativity. Just the good stuff, ready when you need it.',
  },
];

const testimonials = [
  { text: 'Starting my mornings with Perk Up Daily changed how I walk into every single day.', name: 'Sarah K.' },
  { text: 'I love seeing my old accomplishments pop up right when I need the reminder.', name: 'Marcus D.' },
  { text: 'Finally an app that keeps things positive without being cheesy.', name: 'Jenna T.' },
];

// Sample delivery cards from the mockup concept
const sampleCards = [
  { label: 'Scripture', labelColor: 'text-sky-600', icon: BookOpen, quote: '"She is clothed with strength and dignity, and she laughs without fear of the future."', attr: '— Proverbs 31:25' },
  { label: 'Affirmation', labelColor: 'text-rose-500', icon: Zap, quote: '"I am building something that will outlast this moment. My work matters."', attr: null },
  { label: 'Memory', labelColor: 'text-amber-600', icon: Star, quote: '"The morning I launched my first project — I cried grateful tears when the messages came in."', attr: 'Logged June 2025' },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{
      background: '#fef9f2',
      backgroundImage: 'radial-gradient(ellipse 90% 55% at 65% 18%, rgba(255,243,210,0.92) 0%, rgba(253,232,175,0.28) 52%, transparent 78%), radial-gradient(ellipse 55% 40% at 8% 72%, rgba(255,236,170,0.38) 0%, transparent 70%)',
    }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{ background: 'rgba(254,249,242,0.72)', borderBottom: '1px solid rgba(44,30,15,0.07)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo mark */}
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <circle cx="18" cy="18" r="18" fill="oklch(0.92 0.12 70)"/>
              <circle cx="18" cy="20" r="7" fill="#d4830a"/>
              <line x1="18" y1="8" x2="18" y2="5" stroke="#d4830a" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="25.5" y1="10.5" x2="27.6" y2="8.4" stroke="#d4830a" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="10.5" y1="10.5" x2="8.4" y2="8.4" stroke="#d4830a" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="28" y1="20" x2="31" y2="20" stroke="#d4830a" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="8" y1="20" x2="5" y2="20" stroke="#d4830a" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="6" y1="27" x2="30" y2="27" stroke="#d4830a" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            </svg>
            <h1 className="font-display text-lg font-semibold" style={{ color: '#2c1e0f' }}>Perk Up Daily</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm" style={{ color: '#7a5c3a' }}>Log in</Button>
            </Link>
            <Link to="/onboarding">
              <Button size="sm" className="text-sm" style={{ background: '#d4830a', color: '#fef9f2' }}>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28 md:pt-32 md:pb-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <p className="font-semibold text-sm mb-4" style={{ color: '#d4830a' }}>Your daily dose of good</p>
            <h2 className="font-display text-4xl md:text-6xl font-semibold leading-tight" style={{ color: '#2c1e0f' }}>
              Capture the good stuff.<br />Let it find you again.
            </h2>
            <p className="text-lg mt-6 leading-relaxed max-w-xl" style={{ color: '#7a5c3a' }}>
              Perk Up Daily helps you log blessings, wins, and moments worth remembering,
              then resurfaces them throughout your day when you need them most.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <Link to="/onboarding">
                <Button size="lg" className="text-base px-8" style={{ background: '#d4830a', color: '#fef9f2' }}>
                  Start your free trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <p className="text-sm mt-2 sm:mt-3" style={{ color: '#c4a882' }}>7 days free, then $3.99/month</p>
            </div>
          </motion.div>

          {/* Preview cards — floating to the right on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="hidden lg:flex flex-col gap-3 absolute right-6 top-20 w-80"
          >
            {/* Spotlight card */}
            <div className="rounded-2xl p-5 shadow-lg relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, #fde8c0 0%, #fffdf8 60%)',
              border: '1px solid #f5d680',
            }}>
              {/* glow blob */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{
                background: 'radial-gradient(circle, rgba(212,131,10,0.15) 0%, transparent 70%)'
              }} />
              <div className="flex items-center gap-1.5 mb-3">
                <BookOpen className="w-3 h-3" style={{ color: '#d4830a' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#d4830a' }}>Scripture of the Morning</span>
              </div>
              <p className="font-display text-sm italic leading-relaxed" style={{ color: '#2c1e0f' }}>
                "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you."
              </p>
              <p className="text-xs mt-2" style={{ color: '#7a5c3a' }}>— Jeremiah 29:11</p>
            </div>

            {/* Mini cards row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.07)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3 h-3 text-rose-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Affirmation</span>
                </div>
                <p className="font-display text-xs italic leading-relaxed" style={{ color: '#2c1e0f' }}>
                  "My work matters beyond what I can see."
                </p>
              </div>
              <div className="rounded-xl p-4" style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.07)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="w-3 h-3 text-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Memory</span>
                </div>
                <p className="font-display text-xs italic leading-relaxed" style={{ color: '#2c1e0f' }}>
                  "Hit 500 subscribers. From zero."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-center mb-4" style={{ color: '#2c1e0f' }}>
            How it works
          </h3>
          <p className="text-center mb-14 max-w-lg mx-auto" style={{ color: '#7a5c3a' }}>
            A simple daily rhythm that keeps the best parts of your life close at hand.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-6"
                style={{
                  background: '#fffdf8',
                  border: '1px solid rgba(44,30,15,0.08)',
                  boxShadow: '0 1px 4px rgba(44,30,15,0.06)',
                }}
              >
                <f.icon className="w-5 h-5 mb-4" style={{ color: '#d4830a' }} />
                <h4 className="font-display text-lg font-semibold mb-2" style={{ color: '#2c1e0f' }}>{f.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#7a5c3a' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-center mb-14" style={{ color: '#2c1e0f' }}>
            People are loving this
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl p-6"
                style={{
                  background: '#fffdf8',
                  border: '1px solid rgba(44,30,15,0.07)',
                  boxShadow: '0 1px 4px rgba(44,30,15,0.06)',
                }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#2c1e0f' }}>"{t.text}"</p>
                <p className="text-xs font-medium" style={{ color: '#c4a882' }}>{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-4" style={{ color: '#2c1e0f' }}>
            Ready to start your day differently?
          </h3>
          <p className="mb-8" style={{ color: '#7a5c3a' }}>
            Try Perk Up Daily free for 7 days. No commitment. Cancel anytime.
          </p>
          <Link to="/onboarding">
            <Button size="lg" className="text-base px-8" style={{ background: '#d4830a', color: '#fef9f2' }}>
              Start your free trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ borderTop: '1px solid rgba(44,30,15,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#c4a882' }}>2025 Perk Up Daily. All rights reserved.</p>
          <div className="flex gap-6 text-sm" style={{ color: '#c4a882' }}>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="mailto:hello@perkupdaily.com" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}