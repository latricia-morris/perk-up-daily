import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function BirthdayBanner({ onComplete }) {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Auto-clear after 4 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
    >
      <div className="text-center">
        <motion.h1
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, repeat: 2 }}
          className="font-display text-5xl font-bold mb-2"
          style={{ color: '#d4830a' }}
        >
          🎉 Happy Birthday! 🎉
        </motion.h1>
        <p className="text-lg font-semibold" style={{ color: '#2c1e0f' }}>
          Today is your day to celebrate!
        </p>
      </div>
    </motion.div>
  );
}