import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const SCIENCE_CARDS = [
  {
    num: 1,
    title: 'Somatic Pacing',
    body: 'Interactive breathing pacers act as a tactical physical override switch for your nervous system, calming fight-or-flight arousal cycles rapidly.',
    proven: 'Immediate physiologic calm and heart rate variability (HRV) management.',
    link: { text: '→ View Vagal Nerve Stimulation Study', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6189422/' },
    mechanism: 'Autonomic Vagal Regulation',
  },
  {
    num: 2,
    title: 'Cognitive Friction',
    body: 'Tactile pattern-interruption mechanics build healthy friction into overthinking habits, breaking active rumination feedback loops.',
    proven: 'Mitigating situational anxiety and stopping looping thought paths.',
    link: { text: '→ Cognitive Bias Modification Review', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5168672/' },
    mechanism: 'Tactical Pattern Interruption',
  },
  {
    num: 3,
    title: 'Metacognitive Restructuring',
    body: 'Guided question frameworks provide structure to challenge narrative cycles, mapping behavioral changes cleanly.',
    proven: 'Modifying self-talk patterns and building emotional resilience metrics.',
    link: { text: '→ Cognitive Restructuring Mechanics', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10440210/' },
    mechanism: 'Socratic Restructuring',
  },
  {
    num: 4,
    title: 'Attentional Selection',
    body: 'Sensory grounding routines pull awareness away from internal panic indicators straight back into spatial reality metrics.',
    proven: 'Grounding sensory overstimulation and stabilizing processing focus.',
    link: { text: '→ Trauma-Informed Grounding Data', url: 'https://www.ncbi.nlm.nih.gov/books/NBK207188/box/part1_ch4.box5/?report=objectonly' },
    mechanism: 'Attentional Re-Allocation',
  },
  {
    num: 5,
    title: 'Neural Encoding & Identity Consolidation',
    body: 'Active processing of metrics trains your Reticular Activating System (RAS) to override default negative threat identification filters. Documenting personal tracking data routes dopaminergic pathways cleanly to ensure steady motivation structures across goal trajectories.',
    proven: 'Overcoming cognitive bias parameters and establishing long-term behavioral identity metrics.',
    link: { text: '→ Neuroplasticity & Habituation Mechanics', url: 'https://www.ncbi.nlm.nih.gov/books/NBK279297/' },
    mechanism: 'Neuro-Plastic Encoding & Reticular Activation Tuning',
    fullWidth: true,
  },
];

export default function ScienceMatrix() {
  return (
    <section>
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        <div className="text-center mb-8">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-2" style={{ color: '#2c1e0f' }}>
            The Science Behind the Perks
          </h3>
          <p className="text-sm md:text-base leading-relaxed max-w-xl mx-auto" style={{ color: '#706F6A' }}>
            Perk Up Daily moves past passive inspiration blocks. Every asset is mapped directly to peer-reviewed mechanisms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {SCIENCE_CARDS.slice(0, 2).map((card, i) => (
            <ScienceCard key={card.num} card={card} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {SCIENCE_CARDS.slice(2, 4).map((card, i) => (
            <ScienceCard key={card.num} card={card} index={i} />
          ))}
        </div>

        <ScienceCard card={SCIENCE_CARDS[4]} index={0} />
      </div>
    </section>
  );
}

function ScienceCard({ card, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="rounded-2xl p-6 md:p-8"
      style={{ background: 'rgba(252,251,247,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(44,30,15,0.06)', boxShadow: '0 2px 12px rgba(44,30,15,0.04)' }}
    >
      <h4 className="font-display text-lg font-semibold mb-3" style={{ color: '#2c1e0f' }}>
        {card.num}. {card.title}
      </h4>

      <p className="text-sm leading-relaxed mb-3" style={{ color: '#4a3520' }}>
        {card.body}
      </p>

      <p className="text-xs leading-relaxed mb-4" style={{ color: '#706F6A' }}>
        <strong style={{ color: '#d4830a' }}>Proven to Help With:</strong> {card.proven}
      </p>

      <a
        href={card.link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium mb-4 transition-opacity hover:opacity-70"
        style={{ color: '#E8A838' }}
      >
        {card.link.text}
        <ExternalLink className="w-3 h-3" />
      </a>

      <div className="flex items-center gap-1.5 pt-3" style={{ borderTop: '1px solid rgba(168,152,136,0.15)' }}>
        <span className="text-[10px] italic" style={{ color: '#908F8A' }}>
          Mechanism: {card.mechanism}
        </span>
      </div>
    </motion.div>
  );
}