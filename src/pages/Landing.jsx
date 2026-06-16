import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Sparkles, Shield, Heart, ArrowRight, Star } from 'lucide-react';
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

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-lg font-semibold text-foreground">Perk Up Daily</h1>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm">Log in</Button>
            </Link>
            <Link to="/onboarding">
              <Button size="sm" className="text-sm bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <p className="text-primary font-medium text-sm mb-4">Your daily dose of good</p>
          <h2 className="font-display text-4xl md:text-6xl font-semibold text-foreground leading-tight">
            Capture the good stuff. Let it find you again.
          </h2>
          <p className="text-lg text-muted-foreground mt-6 leading-relaxed max-w-xl">
            Perk Up Daily helps you log blessings, wins, and moments worth remembering, 
            then resurfaces them throughout your day when you need them most.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
            <Link to="/onboarding">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-base px-8">
                Start your free trial <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-2 sm:mt-3">7 days free, then $3.99/month</p>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-surface-offset py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground text-center mb-4">
            How it works
          </h3>
          <p className="text-muted-foreground text-center mb-14 max-w-lg mx-auto">
            A simple daily rhythm that keeps the best parts of your life close at hand.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-display text-lg font-semibold mb-2">{f.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground text-center mb-14">
            People are loving this
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
                <p className="text-xs text-muted-foreground font-medium">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Ready to start your day differently?
          </h3>
          <p className="text-muted-foreground mb-8">
            Try Perk Up Daily free for 7 days. No commitment. Cancel anytime.
          </p>
          <Link to="/onboarding">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-base px-8">
              Start your free trial <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Perk Up Daily. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="mailto:hello@perkupdaily.com" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}