import { motion } from 'framer-motion';
import { Wind, ZapOff, Brain, Target, Archive, ExternalLink } from 'lucide-react';

const BRAIN_VIDEO = 'https://media.base44.com/videos/public/6a312911bcddb0806c388af8/a741360da_Brainglowanimated.mp4';

const SCIENCE_CARDS = [
  {
    num: 1,
    title: 'Somatic Pacing',
    icon: Wind,
    body: "When stress takes over, telling yourself to 'just calm down' rarely works—your body has to lead the way. Our interactive breathing and sighing pacers act as a physical override switch for your nervous system, gently cooling down your fight-or-flight response in under two minutes.",
    proven: 'Rapid acute stress reduction, lowering heart rate variability (HRV) stress markers, and restoring immediate physiological calm.',
    links: [
      { text: '→ View Vagal Nerve Stimulation Study', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6189422/' },
      { text: '→ Read Autonomic Regulation Research', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11856507/' },
    ],
    mechanism: 'Autonomic Vagal Regulation',
  },
  {
    num: 2,
    title: 'Cognitive Friction',
    icon: ZapOff,
    body: "It is incredibly easy to get trapped in a spinning wheel of overthinking or worry. These interactive drills create a split-second pause—a moment of healthy friction—that gracefully breaks the loop and redirects your active focus toward logic, safety, and action.",
    proven: 'Stopping active rumination cycles, reducing situational anxiety, and interrupting compulsive mental loops.',
    links: [
      { text: '→ Cognitive Bias Modification Review', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5168672/' },
      { text: '→ Rumination Vulnerability Studies', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6641555/' },
    ],
    mechanism: 'Tactical Pattern Interruption',
  },
  {
    num: 3,
    title: 'Metacognitive Restructuring',
    icon: Brain,
    body: 'The stories we tell ourselves shape our daily reality and identity. Our deep-dive mindset prompts and evidence-check drills act like a friendly, supportive cross-examination. They help you step outside your thoughts, look at them objectively, and rewrite them with clarity and truth.',
    proven: 'Reframing negative self-talk, boosting self-efficacy, and building long-term emotional resilience.',
    links: [
      { text: '→ Cognitive Restructuring Mechanics', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10440210/' },
      { text: '→ Clinical Stress Management Review', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8489050/' },
    ],
    mechanism: 'Socratic Restructuring',
  },
  {
    num: 4,
    title: 'Attentional Selection',
    icon: Target,
    body: 'When your mind feels scattered across yesterday\'s regrets or tomorrow\'s to-do list, you lose your power in the present. Tools like our 5-4-3-2-1 Grounding use interactive sensory checks to anchor your attention right back to the room you are standing in.',
    proven: 'Grounding through panic or sensory overload, restoring immediate executive focus, and mindful presence.',
    links: [
      { text: '→ Trauma-Informed Grounding Data', url: 'https://www.ncbi.nlm.nih.gov/books/NBK207188/box/part1_ch4.box5/?report=objectonly' },
      { text: '→ Acute Physiologic Stress Reduction', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11519409/' },
    ],
    mechanism: 'Attentional Re-Allocation',
  },
  {
    num: 5,
    title: 'Neural Encoding & Identity Consolidation',
    icon: Archive,
    body: "Your brain naturally scans for threats and negatives to keep you safe—a survival habit known as the evolutionary negativity bias that can leave you feeling drained. Features like Life Wins, Blessings, Identity Upgrades, and Visions & Goals aren't just for memory lane; they are designed to retrain your brain's filtering system. By actively documenting and interacting with these tracking metrics, you trigger neuroplastic installation to physically strengthen positive neural pathways, program your Reticular Activating System (RAS) filter to find external wins, and build a structured dopaminergic pathway that fuels motivation during the pursuit of goals to prevent long-term burnout.",
    proven: "Overcoming the brain's natural negativity bias, cultivating long-term trait gratitude, tuning the Reticular Activating System, and solidifying a resilient self-identity.",
    links: [
      { text: '→ Neuroplasticity & Habituation Mechanics', url: 'https://www.ncbi.nlm.nih.gov/books/NBK279297/' },
      { text: '→ Behavioral Activation Protocols', url: 'https://pubmed.ncbi.nlm.nih.gov/29080588/' },
    ],
    mechanism: 'Neuro-Plastic Encoding & Reticular Activation Tuning',
    fullWidth: true,
  },
];

export default function ScienceMatrix() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Brain video — blends with background, no controls */}
        <div className="flex justify-center mb-6">
          <video
            src={BRAIN_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-md"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: '#2c1e0f' }}>
            The Science Behind the Perks
          </h3>
          <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: '#7a5c3a' }}>
            Perk Up Daily goes beyond inspiration. Every interactive drill and library feature is engineered around proven neuro-somatic mechanisms to help you regulate, refocus, and retrain your thought patterns.
          </p>
        </div>

        {/* Row 1: Cards 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {SCIENCE_CARDS.slice(0, 2).map((card, i) => (
            <ScienceCard key={card.num} card={card} index={i} />
          ))}
        </div>

        {/* Row 2: Cards 3 & 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {SCIENCE_CARDS.slice(2, 4).map((card, i) => (
            <ScienceCard key={card.num} card={card} index={i} />
          ))}
        </div>

        {/* Row 3: Card 5 (full width) */}
        <ScienceCard card={SCIENCE_CARDS[4]} index={0} />

        {/* Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-xs italic leading-relaxed max-w-2xl mx-auto" style={{ color: '#a89888' }}>
            Disclaimer: Perk Up Daily offers educational utilities and interactive tools for cognitive pacing and neuro-somatic regulation. This software does not provide clinical diagnoses, medical therapy, or neurological treatment.
          </p>
        </div>
      </div>
    </section>
  );
}

function ScienceCard({ card, index }) {
  const Icon = card.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="rounded-2xl p-6"
      style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.08)', boxShadow: '0 1px 4px rgba(44,30,15,0.06)' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(232,168,56,0.12)' }}>
          <Icon className="w-5 h-5" style={{ color: '#E8A838' }} />
        </div>
        <h4 className="font-display text-lg font-semibold" style={{ color: '#2c1e0f' }}>
          {card.num}. {card.title}
        </h4>
      </div>

      <p className="text-sm leading-relaxed mb-3" style={{ color: '#4a3520' }}>
        {card.body}
      </p>

      <p className="text-xs leading-relaxed mb-4" style={{ color: '#7a5c3a' }}>
        <strong style={{ color: '#d4830a' }}>Proven to Help With:</strong> {card.proven}
      </p>

      <div className="flex flex-col gap-1.5 mb-4">
        {card.links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium inline-flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: '#E6B800' }}
          >
            {link.text}
            <ExternalLink className="w-3 h-3" />
          </a>
        ))}
      </div>

      <div className="flex items-center gap-1.5 pt-3" style={{ borderTop: '1px solid rgba(168,152,136,0.15)' }}>
        <span className="text-xs">⚡</span>
        <span className="text-[10px] italic" style={{ color: '#a89888' }}>
          Mechanism: {card.mechanism}
        </span>
      </div>
    </motion.div>
  );
}