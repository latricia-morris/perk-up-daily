import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Sparkles, Shield, Heart, ArrowRight, Star, BookOpen, Zap, ChevronDown, ChevronUp, Trophy, Share2, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BRAIN_IMAGE = 'https://media.base44.com/images/public/6a312911bcddb0806c388af8/a83b10a31_BrainGlow2.png';

// ── Hero card preview ──────────────────────────────────────────────────────
function HeroCards() {
  const [christianOn, setChristianOn] = useState(false);

  // Auto-toggle every 3.5s
  useEffect(() => {
    const id = setInterval(() => setChristianOn((v) => !v), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto lg:mx-0">
      {/* Affirmation card — always shown */}
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

      {/* Mini cards row */}
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

      {/* Toggle */}
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

      {/* Scripture card — always in DOM to prevent layout shift, visibility+opacity only */}
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
    </div>);

}

// ── FAQ Accordion ─────────────────────────────────────────────────────────
const faqs = [
{
  q: 'What is Perk Up Daily?',
  a: 'It is a daily encouragement app that helps you log the good things in your life and resurfaces them throughout your day at morning, midday, and in the evening. Think of it as an easy add positivity practice that brings compounding joy.'
},
{
  q: 'Is this a faith-based app?',
  a: 'It is faith-friendly. You can turn Christian content on or off in your settings. With it on, you get scriptures and the Deep Faith category. With it off, the app works beautifully without any religious content. You are in complete control.'
},
{
  q: 'Can I add my own content?',
  a: 'Yes, and that is the heart of the app. You can log your own memories, wins, blessings, milestones, affirmations, quotes, and personal notes. The more you add, the more personal your daily deliveries become.'
},
{
  q: 'What happens after my free trial?',
  a: 'After 7 days your subscription begins at $4.99 per month. You will receive a reminder before you are charged, and you can cancel at any time directly from your account settings.'
},
{
  q: 'How is this different from a journal app?',
  a: 'A journal captures your thoughts. Perk Up Daily brings them back to you. You do not have to dig through old entries to find something meaningful. The app surfaces the right thing at the right time.'
},
{
  q: 'Can I cancel anytime?',
  a: 'Yes, with one tap and no questions asked.'
}];


function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(44,30,15,0.1)' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4">
        
        <span className="text-sm font-semibold" style={{ color: '#2c1e0f' }}>{q}</span>
        {open ?
        <ChevronUp className="w-4 h-4 shrink-0" style={{ color: '#d4830a' }} /> :
        <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#c4a882' }} />
        }
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden">
          
            <p className="pb-4 text-sm leading-relaxed" style={{ color: '#7a5c3a' }}>{a}</p>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

// ── Timeline ──────────────────────────────────────────────────────────────
const timelineItems = [
{ time: 'Within the first few days', desc: 'New neural connections begin forming with each repetition of positive focus.' },
{ time: 'Around 3 to 4 weeks', desc: 'Patterns start to feel more automatic. The brain begins reaching for the good more readily.' },
{ time: 'Around 3 months', desc: 'Lasting structural changes in the brain take hold. Joy, creativity, and a healthier mood start to feel like your default.' }];


// ── CTA helper ─────────────────────────────────────────────────────────────
function CtaBlock() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Link to="/onboarding">
        <Button size="lg" className="text-base px-8" style={{ background: '#E8A838', color: '#fef9f2' }}>
          Start your free 7-day trial <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
      <p className="text-sm" style={{ color: '#c4a882' }}>7 days free, then $4.99/month. Cancel anytime.</p>
    </div>);

}

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
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm" style={{ color: '#7a5c3a' }}>Log in</Button>
            </Link>
            <Link to="/onboarding">
              <Button size="sm" className="text-sm" style={{ background: '#E8A838', color: '#fef9f2' }}>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: HERO ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-6 md:pt-24 md:pb-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 max-w-xl">
            
            <p className="font-semibold text-sm mb-4" style={{ color: '#E8A838' }}>Your daily dose of good</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight" style={{ color: '#2c1e0f' }}>
              Capture the good stuff. Let it find you again.
            </h2>
            <p className="text-lg mt-5 leading-relaxed" style={{ color: '#7a5c3a' }}>
              Perk Up Daily resurfaces your best memories, wins, and moments of faith throughout your day, right when you need them most.
            </p>
            <div className="flex flex-col items-start gap-2 mt-7">
              <Link to="/onboarding">
                <Button size="lg" className="text-base px-8" style={{ background: '#E8A838', color: '#fef9f2' }}>
                  Start your free 7-day trial <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <p className="text-sm" style={{ color: '#c4a882' }}>7 days free, then $4.99/month. Cancel anytime.</p>
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

      {/* ── SECTION 2: SOCIAL PROOF ───────────────────────────────────── */}
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
            { text: 'Finally an app that keeps things positive without being cheesy.', name: 'Jenna T.' }].
            map((t, i) =>
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
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: YOUR STORY ─────────────────────────────────────── */}
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
            <p className="text-xs" style={{ color: '#7a5c3a' }}>The Brand Revivalist® and owner of Ox & Iron, LLC</p>
          </div>

          <div className="mt-6 flex justify-center">
            <img
              src="https://media.base44.com/images/public/6a312911bcddb0806c388af8/8873b56bc_DSC_2093sunny.png"
              alt="LaTricia Morris, Founder"
              className="w-72 md:w-80 object-contain" />
            
          </div>

          <div className="mt-8 flex flex-col items-center">
            <CtaBlock />
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

      {/* ── SECTION 3.5: PERK UP PLAYS IT BACK ────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-semibold mb-3 text-xl" style={{ color: '#E8A838' }}>Your best moments deserve more than a box in the basement.</p>
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-6" style={{ color: '#2c1e0f' }}>
            Perk Up plays it back.
          </h3>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#4a3520' }}>
            <p>Journaling is great, until it isn't. Traditional journals leave your best moments collecting dust—on a physical shelf or in an endless digital log. They're forgotten by everyone except those who make a practice of digging through the pile to find the "worthwhile" moment.</p>
            <p>Perk Up finds them for you. We add your best moments into your daily rotation, mixing them in with our curated wisdom. Each entry you store makes its way into the mix, so you don't just get a bunch of generic positive quotes; you get to relive the moments that have actually meant the most to you.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3.6: THE ENGINE FOR YOUR EVOLUTION ────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-semibold mb-3 text-xl" style={{ color: '#E8A838' }}>The Engine for Your Evolution</p>
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-6" style={{ color: '#2c1e0f' }}>
            Perk Up celebrates &amp; elevates YOU.
          </h3>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#4a3520' }}>
            <p><strong>We don't just track your milestones; we help you build momentum toward bigger life wins.</strong></p>
            <p>There is a common thread among many of today's most successful, adored, and influential people. They have learned the art of mindset shifts that propel them toward a brighter future.</p>
            <p>This isn't just positive thinking—it's allowing yourself to process the world through distinct filters, choosing for yourself the kind of life you want and how you will define your own experience.</p>
            <p>We guide you through your growth with intentional questions and prompts that give you room to identify opportunities to elevate your thinking and choose who you want to be.</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: MORE SOCIAL PROOF ─────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-8" style={{ color: '#2c1e0f' }}>
            What people are saying
          </h3>
          <div className="space-y-5">
            {[
            'The brain can be retrained to operate on a more positive frequency. But it takes intention. This app is that intention made daily.',
            'You deserve to live life to the fullest. Not someday. Starting tomorrow morning.'].
            map((quote, i) =>
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl p-6"
              style={{
                background: '#fffdf8',
                borderLeft: '4px solid #E8A838',
                border: '1px solid rgba(44,30,15,0.07)',
                borderLeftWidth: '4px',
                borderLeftColor: '#E8A838',
                boxShadow: '0 1px 4px rgba(44,30,15,0.06)'
              }}>
              
                <p className="font-display text-base italic leading-relaxed" style={{ color: '#2c1e0f' }}>"{quote}"</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: THE SCIENCE ────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-2" style={{ color: '#2c1e0f' }}>
            What if your brain could be rewired for joy?
          </h3>
          <p className="font-semibold mb-6 text-xl" style={{ color: '#E8A838' }}>Science says it can.</p>

          {/* Brain image & text layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8 items-start">
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: '#4a3520' }}>
              <p>Your brain is not fixed. Science has proven that it is constantly rewiring itself based on what you repeatedly put in front of it. Every time you bring something good into focus, your brain forms a new connection around it. Every time you come back to it, that connection gets stronger. Do that enough times and your brain stops having to work to find the good. It just starts going there on its own.</p>
              <p>Gratitude practices, positive reflection, and daily reinforcement of good experiences are among the most studied and evidence-supported tools for shifting how the brain operates. New neural pathways can begin forming within days of consistent practice and keep strengthening the more you repeat them.</p>
              <p>That is exactly what Perk Up Daily was built to do. Every entry you log and every delivery you receive is adding another rep, and <strong>every rep counts</strong>.</p>
            </div>
            <div className="flex justify-center">
              <img src={BRAIN_IMAGE} alt="Neural pathways illustration" className="w-full max-w-lg object-contain" />
            </div>
          </div>



          {/* Citation buttons */}
          <div className="flex flex-wrap gap-2 mb-10">
            {[
            { label: 'NIH: Neuroplasticity', url: 'https://www.ncbi.nlm.nih.gov/books/NBK557811/' },
            { label: 'Psychology Today: Rewiring the Brain', url: 'https://www.psychologytoday.com/us/blog/making-the-whole-beautiful/202404/rewiring-the-traumatized-brain-for-positivity' },
            { label: 'How Long Does Neuroplasticity Take?', url: 'https://www.re-origin.com/articles/how-long-to-rewire-brain' }].
            map((c) =>
            <a
              key={c.label}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
              style={{ background: '#E8A838', color: '#2c1e0f' }}>
              
                {c.label}
              </a>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-2xl p-6 space-y-5" style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.08)' }}>
            {timelineItems.map((item, i) =>
            <div key={i} className="flex gap-4 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-3 h-3 rounded-full mt-1" style={{ background: '#E8A838' }} />
                  {i < timelineItems.length - 1 &&
                <div className="w-0.5 flex-1 mt-1" style={{ background: 'rgba(232,168,56,0.25)', minHeight: '32px' }} />
                }
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: '#E8A838' }}>{item.time}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#4a3520' }}>{item.desc}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: WHAT YOU GET ───────────────────────────────────── */}
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
            { icon: Shield, title: 'No negativity. Ever.', desc: 'The app gently flags entries that could bring you down and asks whether that is really what you want coming back to you on a hard morning.' }].
            map((f, i) =>
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
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: THE OFFER ─────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: '#2c1e0f' }}>
            Start your free trial and Perk Up today.
          </h3>
          <p className="text-3xl font-display font-bold mb-4" style={{ color: '#E8A838' }}>$4.99 per month</p>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#7a5c3a' }}>
            Your free trial gives you 7 full days of access before you are charged anything. You get full access from day one, you can cancel with one tap at any time, and the app is available on iOS, Android, and desktop.
          </p>
          <CtaBlock />
        </div>
      </section>

      {/* ── SECTION 8: THE GUARANTEE ─────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl px-8 md:px-12 py-12 md:py-16" style={{ background: '#332D29' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Left Column: Side Effects */}
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
                  'Becoming more aware of the wins, blessings, and beauty already in your life'].
                  map((item, i) =>
                  <li key={i} className="flex gap-3 text-sm" style={{ color: '#e8dcc8' }}>
                      <span style={{ color: '#E8A838' }} className="shrink-0 font-semibold">•</span>
                      <span>{item}</span>
                    </li>
                  )}
                </ul>
                <p className="text-xs" style={{ color: '#b8a889' }}>
                  Results may vary, but the future is bright. It is time to Perk Up.
                </p>
              </div>

              {/* Right Column: No Risk */}
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

      {/* ── SECTION 9: EVEN MORE SOCIAL PROOF ───────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-center mb-8" style={{ color: '#2c1e0f' }}>
            More from the people using it
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
            { text: 'I did not expect to cry. I logged something small and it came back three days later on the worst morning. That is the app working.', name: 'Danielle R.' },
            { text: 'It feels like a hug from your past self. Whoever built this understood something important about how people actually heal.', name: 'James T.' }].
            map((t, i) =>
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
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 10: FAQ ──────────────────────────────────────────── */}
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

      {/* ── SECTION 11: FINAL CTA ────────────────────────────────────── */}
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
          <p className="text-sm" style={{ color: '#c4a882' }}>2025 Perk Up Daily. All rights reserved.</p>
          <div className="flex gap-6 text-sm" style={{ color: '#c4a882' }}>
            <Link to="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <a href="mailto:latriciamorris@gmail.com" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>);

}