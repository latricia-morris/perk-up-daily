import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

const MILESTONES = [3, 7, 14, 21, 30, 60, 90, 180, 365];

function calcStreak(entries) {
  if (!entries || entries.length === 0) return 0;

  // Collect unique dates with entries
  const dates = new Set(
    entries
      .filter(e => e.created_date)
      .map(e => e.created_date.split('T')[0])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = new Date(today);

  // Allow today or yesterday as starting point (so streak doesn't break mid-day)
  const todayStr = cursor.toISOString().split('T')[0];
  const hasTodayEntry = dates.has(todayStr);

  if (!hasTodayEntry) {
    // Check yesterday — if no entry yesterday either, streak is 0
    cursor.setDate(cursor.getDate() - 1);
    const yesterdayStr = cursor.toISOString().split('T')[0];
    if (!dates.has(yesterdayStr)) return 0;
  }

  // Walk backwards counting consecutive days
  while (dates.has(cursor.toISOString().split('T')[0])) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getMilestoneMessage(streak) {
  if (!MILESTONES.includes(streak)) return null;
  const messages = {
    3:   'Three days strong.',
    7:   'One full week. Keep going.',
    14:  'Two weeks straight. You\'re building something real.',
    21:  '21 days — this is becoming a habit.',
    30:  'One month. Incredible.',
    60:  'Two months of showing up. Outstanding.',
    90:  '90 days. This is who you are now.',
    180: 'Half a year of good days. Remarkable.',
    365: 'One full year. You did it.',
  };
  return messages[streak] || null;
}

export default function StreakCounter({ entries }) {
  const streak = useMemo(() => calcStreak(entries), [entries]);
  const milestone = getMilestoneMessage(streak);

  if (streak === 0) return null;

  const flameColor = streak >= 30 ? '#e05a00' : streak >= 7 ? '#d4830a' : '#f0a830';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mb-8"
    >
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, #fde8c0 0%, #fffdf8 65%)',
          border: '1px solid rgba(212,131,10,0.18)',
          boxShadow: '0 1px 6px rgba(212,131,10,0.08)',
        }}
      >
        <div className="flex flex-col items-center min-w-[48px]">
          <Flame className="w-6 h-6" style={{ color: flameColor }} />
          <span className="font-display text-2xl font-bold leading-tight mt-0.5" style={{ color: '#2c1e0f' }}>
            {streak}
          </span>
          <span className="text-xs" style={{ color: '#c4a882' }}>
            {streak === 1 ? 'day' : 'days'}
          </span>
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: '#2c1e0f' }}>
            {streak === 1 ? 'You started a streak.' : `${streak}-day streak`}
          </p>
          <AnimatePresence mode="wait">
            {milestone ? (
              <motion.p
                key="milestone"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs mt-0.5 font-medium"
                style={{ color: '#d4830a' }}
              >
                {milestone}
              </motion.p>
            ) : (
              <motion.p
                key="normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs mt-0.5"
                style={{ color: '#7a5c3a' }}
              >
                Add an entry today to keep it going.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}