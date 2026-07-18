import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Wind, Lightbulb, Brain as BrainCircuit, Shuffle, ChevronRight } from 'lucide-react';
import { BREATHING_EXERCISES, EXERCISE_TYPES } from '@/lib/exerciseRegistry';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const TYPE_ICONS = {
  breathing: Wind,
  perspective: Lightbulb,
  cognitive_drill: BrainCircuit,
  reframing: Shuffle,
};

const TYPE_ACCENTS = {
  breathing: '#219EBC',
  perspective: '#BA1650',
  cognitive_drill: '#5C3B8F',
  reframing: '#F95826',
};

export default function NeuralTraining() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState('breathing');

  const { data: perspectivePrompts = [] } = useQuery({
    queryKey: ['neural-perspective-prompts'],
    queryFn: () => base44.entities.ReflectionPrompt.filter({ status: 'active' }),
    enabled: activeType === 'perspective',
  });

  const { data: dbExercises = [] } = useQuery({
    queryKey: ['neural-training-exercises', activeType],
    queryFn: () => base44.entities.NeuralTraining.filter({ exercise_type: activeType, status: 'active' }, 'sort_order'),
    enabled: activeType !== 'breathing' && activeType !== 'perspective',
  });

  return (
    <div className="min-h-screen p-4 md:p-8 w-full max-w-3xl mx-auto" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 120px)' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-6 h-6" style={{ color: '#5C3B8F' }} />
          <h1 className="font-display text-2xl md:text-3xl font-semibold" style={{ color: '#2c1e0f' }}>
            Neural Training
          </h1>
        </div>
        <p className="text-sm" style={{ color: '#c4a882' }}>
          Active tools to regulate, refocus, and retrain your thought patterns.
        </p>
      </div>

      {/* Category filter buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {EXERCISE_TYPES.map((type) => {
          const Icon = TYPE_ICONS[type.slug] || Wind;
          const isActive = activeType === type.slug;
          const accent = TYPE_ACCENTS[type.slug];
          return (
            <button
              key={type.slug}
              onClick={() => setActiveType(type.slug)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all active:scale-95"
              style={{
                background: isActive ? accent : 'transparent',
                color: isActive ? '#FFFCF2' : '#2F2C29',
                border: `1px solid ${isActive ? accent : 'rgba(47,44,41,0.12)'}`,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-sm mb-6 leading-relaxed" style={{ color: '#7a5c3a' }}>
        {EXERCISE_TYPES.find(t => t.slug === activeType)?.description}
      </p>

      {/* Exercise list */}
      {activeType === 'breathing' && (
        <div className="space-y-3">
          {BREATHING_EXERCISES.map((ex, i) => (
            <ExerciseCard key={ex.id} exercise={ex} onClick={() => navigate(ex.route)} index={i} />
          ))}
        </div>
      )}

      {activeType === 'perspective' && (
        <div className="space-y-3">
          {perspectivePrompts.length > 0 ? (
            perspectivePrompts.map((prompt, i) => (
              <ExerciseCard
                key={prompt.id}
                exercise={{
                  title: 'Perspective Prompt',
                  description: prompt.prompt,
                  rhythm: 'Question-based',
                  accent: '#BA1650',
                }}
                onClick={() => navigate('/reflections', { state: { selectedPrompt: prompt } })}
                index={i}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="w-8 h-8 mx-auto mb-3" style={{ color: '#c4a882' }} />
              <p className="text-sm" style={{ color: '#c4a882' }}>Perspective prompts are loading.</p>
            </div>
          )}
        </div>
      )}

      {(activeType === 'cognitive_drill' || activeType === 'reframing') && (
        <div className="space-y-3">
          {dbExercises.length > 0 ? (
            dbExercises.map((ex, i) => (
              <ExerciseCard
                key={ex.id}
                exercise={{
                  title: ex.title,
                  description: ex.description || ex.content,
                  rhythm: ex.route ? 'Interactive' : 'Prompt-based',
                  accent: TYPE_ACCENTS[activeType],
                }}
                onClick={() => ex.route ? navigate(ex.route) : null}
                index={i}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <BrainCircuit className="w-8 h-8 mx-auto mb-3" style={{ color: '#c4a882' }} />
              <p className="text-sm" style={{ color: '#c4a882' }}>
                {activeType === 'cognitive_drill'
                  ? 'Cognitive drills are coming soon. Stay tuned!'
                  : 'Reframing exercises are coming soon. Stay tuned!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ exercise, onClick, index }) {
  const accent = exercise.accent || '#D4830A';
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className="w-full text-left rounded-2xl p-5 transition-all hover:shadow-md active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, rgba(255,252,242,0.8) 0%, rgba(255,252,242,0.5) 100%)',
        border: `1px solid ${accent}22`,
        boxShadow: '0 2px 12px rgba(47,44,41,0.04)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: `${accent}1A`, color: accent }}
            >
              {exercise.rhythm}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold mb-1" style={{ color: '#2c1e0f' }}>
            {exercise.title}
          </h3>
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#7a5c3a' }}>
            {exercise.description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 shrink-0 mt-1" style={{ color: accent }} />
      </div>
    </motion.button>
  );
}