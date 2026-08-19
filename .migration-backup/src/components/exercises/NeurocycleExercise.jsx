import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import NeurocycleDay1 from './NeurocycleDay1';
import NeurocycleDailyCheckIn from './NeurocycleDailyCheckIn';
import NeurocycleComplete from './NeurocycleComplete';
import { Loader2 } from 'lucide-react';

const PALETTE = {
  page: '#fbf6ef',
  ink: '#2F2C29',
  violet: '#5C3B8F',
  cream: '#FFFCF2',
};

export default function NeurocycleExercise() {
  const [view, setView] = useState('loading'); // loading | day1 | checkin | complete | done_today

  // Query for any active cycle
  const { data: activeCheckIns = [], isLoading } = useQuery({
    queryKey: ['neurocycle-active'],
    queryFn: () => base44.entities.NeurocycleCheckIn.filter({ cycle_status: 'active' }, '-cycle_date'),
  });

  useEffect(() => {
    if (isLoading) return;

    if (activeCheckIns.length === 0) {
      setView('day1');
      return;
    }

    // Find the Day 1 record to get cycle info
    const day1Record = activeCheckIns.find(c => c.cycle_day === 1) || activeCheckIns[activeCheckIns.length - 1];
    const cycleId = day1Record.cycle_id;
    const startDate = new Date(day1Record.cycle_date);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const currentDay = daysSinceStart + 1;

    // Check if today's check-in already exists
    const todayStr = today.toISOString().slice(0, 10);
    const alreadyDoneToday = activeCheckIns.some(c => c.cycle_date === todayStr);

    if (currentDay > 21) {
      // Cycle is complete — mark it and show completion
      setView('complete');
      return;
    }

    if (alreadyDoneToday) {
      setView('done_today');
      return;
    }

    // Show the daily check-in for the current day
    setView('checkin');
  }, [activeCheckIns, isLoading]);

  if (isLoading || view === 'loading') {
    return (
      <div
        className="relative h-screen w-full flex flex-col items-center justify-center"
        style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}
      >
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: PALETTE.violet }} />
      </div>
    );
  }

  const day1Record = activeCheckIns.find(c => c.cycle_day === 1) || activeCheckIns[activeCheckIns.length - 1];
  const startDate = day1Record ? new Date(day1Record.cycle_date) : new Date();
  const currentDay = day1Record
    ? Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  if (view === 'day1') {
    return <NeurocycleDay1 onDone={() => setView('done_today')} />;
  }

  if (view === 'checkin' && day1Record) {
    return (
      <NeurocycleDailyCheckIn
        cycleId={day1Record.cycle_id}
        day={currentDay}
        focusThought={day1Record.focus_thought || day1Record.captured_thought}
        replacementThought={day1Record.replacement_thought || day1Record.reconceptualized_thought}
        onDone={() => setView('done_today')}
        onCompleteCycle={() => setView('complete')}
      />
    );
  }

  if (view === 'complete' && day1Record) {
    return (
      <NeurocycleComplete
        cycleId={day1Record.cycle_id}
        focusThought={day1Record.focus_thought || day1Record.captured_thought}
        replacementThought={day1Record.replacement_thought || day1Record.reconceptualized_thought}
      />
    );
  }

  // done_today
  return (
    <div
      className="relative h-screen w-full flex flex-col items-center justify-center px-5 text-center"
      style={{ background: PALETTE.page, fontFamily: "'DM Sans', sans-serif", color: PALETTE.ink }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: `linear-gradient(135deg, ${PALETTE.violet} 0%, #219EBC 100%)` }}
      >
        <span className="text-2xl">✓</span>
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: PALETTE.ink }}>
        You've checked in today.
      </h2>
      <p className="text-sm mt-2" style={{ color: `${PALETTE.ink}A6` }}>
        Come back tomorrow to continue your 21-day cycle.
      </p>
      <p className="text-xs mt-1" style={{ color: `${PALETTE.ink}80` }}>
        Day {currentDay} of 21
      </p>
    </div>
  );
}