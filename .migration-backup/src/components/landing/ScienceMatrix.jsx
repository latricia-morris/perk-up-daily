import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const BRAIN_IMG = 'https://media.base44.com/images/public/6a312911bcddb0806c388af8/9f842113f_BrainGlow2.png';

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
  },
];

const CARD_ACCENTS = ['#F95826', '#BA1650', '#E8A838', '#219EBC', '#5C3B8F'];

export default function ScienceMatrix() {
  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        {/* Intro + Brain: side-by-side */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-10 md:mb-14">
          <div className="md:w-1/2 text-center md:text-left">
            <p className="text-sm font-semibold mb-2" style={{ color: '#F95826' }}>The Science Behind the Perks</p>
            <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: '#2c1e0f' }}>
              What your brain could be up to
            </h3>
            <p className="text-sm md:text-base leading-relaxed max-w-xl" style={{ color: '#7a5c3a' }}>
              Perk Up Daily moves past passive inspiration. Every tool is mapped directly to peer-reviewed mechanisms for real neuroplastic change.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src={BRAIN_IMG}
              alt="Brain neuroplasticity illustration"
              className="w-full max-w-[400px] md:max-w-[480px]"
            />
          </div>
        </div>

        {/* Row of 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {SCIENCE_CARDS.slice(0, 3).map((card, i) => (
            <ScienceCard key={card.num} card={card} index={i} />
          ))}
        </div>

        {/* Row of 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCIENCE_CARDS.slice(3).map((card, i) => (
            <ScienceCard key={card.num} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ScienceCard({ card, index }) {
  const accent = CARD_ACCENTS[(card.num - 1) % CARD_ACCENTS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="rounded-2xl p-6 md:p-8"
      style={{ background: 'rgba(252,251,247,0.75)', backdropFilter: 'blur(12px)', border: `1px solid ${accent}1A`, boxShadow: '0 4px 16px rgba(44,30,15,0.05)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: `${accent}1A`, color: accent }}>
          {card.num}
        </span>
        <h4 className="font-display text-lg font-semibold" style={{ color: '#2c1e0f' }}>
          {card.title}
        </h4>
      </div>

      <p className="text-sm leading-relaxed mb-3" style={{ color: '#4a3520' }}>
        {card.body}
      </p>

                <p className="text-sm leading-relaxed mb-4" style={{ color: '#7a5c3a' }}>
          <strong style={{ color: accent }}>Proven to Help With:</strong> {card.proven}
        </p>

      <a
        href={card.link.url}
        target="_blank"
        rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold mb-4 transition-opacity hover:opacity-70"
        style={{ color: accent }}
      >
        {card.link.text}
                  <ExternalLink className="w-4 h-4" />
      </a>

      <div className="flex items-center gap-1.5 pt-3" style={{ borderTop: '1px solid rgba(168,152,136,0.15)' }}>
                <span className="text-xs italic" style={{ color: '#a89888' }}>
          🔬 Mechanism: {card.mechanism}
        </span>
      </div>
    </motion.div>
  );
}