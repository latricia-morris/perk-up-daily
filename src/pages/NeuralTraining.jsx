import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Wind, Brain as BrainCircuit, Shuffle, ChevronRight, Atom } from 'lucide-react';
import { ALL_STATIC_EXERCISES, EXERCISE_TYPES } from '@/lib/exerciseRegistry';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const TYPE_ICONS = {
  breathing: Wind,
  perspective: Atom,
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

  const staticExercises = ALL_STATIC_EXERCISES.filter(ex => ex.categories?.includes(activeType));

  return (
    <div className="min-h-screen p-4 md:p-8 w-full max-w-5xl mx-auto" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 120px)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-6 h-6" style={{ color: '#BA1650' }} />
          <h1 className="font-display text-2xl md:text-3xl font-semibold" style={{ color: '#2c1e0f' }}>
            Neural Training
          </h1>
        </div>
        <p className="text-sm" style={{ color: '#c4a882' }}>
          Active tools to regulate, refocus, and retrain your thought patterns.
        </p>
      </div>

      {/* Category filter — glass gradient grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {EXERCISE_TYPES.map((type) => {
          const Icon = TYPE_ICONS[type.slug] || Wind;
          const isActive = activeType === type.slug;
          const accent = TYPE_ACCENTS[type.slug];
          return (
            <button
              key={type.slug}
              onClick={() => setActiveType(type.slug)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl text-sm font-medium transition-all active:scale-95"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`
                  : 'linear-gradient(135deg, rgba(255,252,242,0.7) 0%, rgba(255,252,242,0.3) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: isActive ? '#FFFCF2' : '#2F2C29',
                border: `1px solid ${isActive ? accent + '44' : 'rgba(212,131,10,0.15)'}`,
                boxShadow: isActive
                  ? `0 6px 20px ${accent}33`
                  : '0 4px 16px rgba(47,44,41,0.06)',
              }}
            >
              <Icon className="w-5 h-5" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-sm mb-6 leading-relaxed" style={{ color: '#7a5c3a' }}>
        {EXERCISE_TYPES.find(t => t.slug === activeType)?.description}
      </p>

      {/* Exercise list — grid */}
      {activeType === 'perspective' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {perspectivePrompts.length > 0 ? (
            perspectivePrompts.map((prompt, i) => (
              <ExerciseGridCard
                key={prompt.id}
                exercise={{
                  title: 'Mindset Prompt',
                  description: prompt.prompt,
                  rhythm: 'Question',
                  accent: '#BA1650',
                }}
                onClick={() => navigate('/reflections', { state: { selectedPrompt: prompt } })}
                index={i}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Atom className="w-8 h-8 mx-auto mb-3" style={{ color: '#c4a882' }} />
              <p className="text-sm" style={{ color: '#c4a882' }}>Mindset prompts are loading.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {staticExercises.map((ex, i) => (
            <ExerciseGridCard
              key={ex.id}
              exercise={ex}
              onClick={() => navigate(ex.route)}
              index={i}
            />
          ))}
          {dbExercises.map((ex, i) => (
            <ExerciseGridCard
              key={ex.id}
              exercise={{
                title: ex.title,
                description: ex.description || ex.content,
                rhythm: ex.route ? 'Interactive' : 'Prompt',
                accent: TYPE_ACCENTS[activeType],
              }}
              onClick={() => ex.route ? navigate(ex.route) : null}
              index={staticExercises.length + i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExerciseGridCard({ exercise, onClick, index }) {
  const accent = exercise.accent || '#D4830A';
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className="text-left rounded-2xl p-4 transition-all hover:shadow-md active:scale-[0.98] flex flex-col h-full min-h-[120px]"
      style={{
        background: 'linear-gradient(135deg, rgba(255,252,242,0.7) 0%, rgba(255,252,242,0.3) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${accent}22`,
        boxShadow: '0 2px 12px rgba(47,44,41,0.04)',
      }}
    >
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: `${accent}1A`, color: accent }}
          >
            {exercise.rhythm}
          </span>
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: accent }} />
        </div>
        <h3 className="font-display text-base font-semibold" style={{ color: '#2c1e0f' }}>
          {exercise.title}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-3 flex-1" style={{ color: '#7a5c3a' }}>
          {exercise.description}
        </p>
      </div>
    </motion.button>
  );
}