import { motion } from 'framer-motion';
import { Check, PlusCircle, X } from 'lucide-react';

/**
 * ExerciseCompletePrompt — overlay shown after completing an exercise sequence.
 * Asks the user if anything came to mind they'd like to save to their personal vault.
 */
export default function ExerciseCompletePrompt({ exerciseName, onClose, onAddToVault }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center px-6"
      style={{ background: 'rgba(47,44,41,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative max-w-sm w-full p-8 rounded-3xl text-center"
        style={{ background: '#fffdf8', border: '1px solid rgba(212,131,10,0.2)', boxShadow: '0 20px 60px rgba(47,44,41,0.15)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full transition-colors hover:bg-muted/50"
          style={{ color: '#c4a882' }}
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'linear-gradient(135deg, #E8A838 0%, #d4830a 100%)', boxShadow: '0 8px 24px rgba(212,131,10,0.3)' }}
        >
          <Check className="w-7 h-7" style={{ color: '#FFFCF2' }} strokeWidth={2.5} />
        </div>

        <h2 className="font-display text-xl font-semibold mb-2" style={{ color: '#2c1e0f' }}>
          Congratulations!
        </h2>
        <p className="text-sm mb-1" style={{ color: '#7a5c3a' }}>
          {exerciseName ? `You completed ${exerciseName}.` : 'You completed your exercise.'}
        </p>
        <p className="text-sm mb-6" style={{ color: '#7a5c3a' }}>
          Did anything come to mind that you'd like to add to your personal vault?
        </p>

        <div className="space-y-2">
          <button
            onClick={onAddToVault}
            className="w-full py-3 rounded-full text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #E8A838 0%, #d4830a 100%)', color: '#FFFCF2' }}
          >
            <PlusCircle className="w-4 h-4" />
            Add to Vault
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full text-sm font-medium transition-all"
            style={{ background: 'transparent', color: '#7a5c3a', border: '1px solid rgba(212,131,10,0.2)' }}
          >
            Not right now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}