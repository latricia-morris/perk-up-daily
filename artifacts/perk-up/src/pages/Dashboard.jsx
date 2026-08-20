import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Sun, CloudSun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGreeting } from '@/lib/constants';
import DeliverySession from '@/components/dashboard/DeliverySession';
import EveningPrompt from '@/components/dashboard/EveningPrompt';
import StreakCounter from '@/components/dashboard/StreakCounter';
import PullToRefresh from '@/components/PullToRefresh';
import BirthdayBanner from '@/components/shared/BirthdayBanner';

const sessionIcons = {
  morning: Sun,
  midday: CloudSun,
  evening: Moon,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showBirthdayBanner, setShowBirthdayBanner] = useState(false);

  const isBirthday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const birthDate = new Date(dateString);
    return (
      today.getMonth() === birthDate.getMonth() &&
      today.getDate() === birthDate.getDate()
    );
  };

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);

      // Check if it's their birthday
      if (u.birthday && isBirthday(u.birthday)) {
        setShowBirthdayBanner(true);
      }

      // Apply onboarding prefs if not yet set
      if (!u.onboarding_completed) {
        const prefs = localStorage.getItem('perkup-onboarding');
        const { christianContent, selectedCategories } = prefs ? JSON.parse(prefs) : {};
        base44.auth.updateMe({
          christian_content: christianContent || false,
          selected_categories: JSON.stringify(selectedCategories || []),
          morning_enabled: u.morning_enabled !== false ? true : u.morning_enabled,
          midday_enabled: u.midday_enabled !== false ? true : u.midday_enabled,
          evening_enabled: u.evening_enabled !== false ? true : u.evening_enabled,
          onboarding_completed: true,
          subscription_status: u.subscription_status || 'trial',
          trial_start_date: u.trial_start_date || new Date().toISOString().split('T')[0],
        }).then(updated => setUser(updated));
        if (prefs) localStorage.removeItem('perkup-onboarding');
      }

      // Apply theme
      if (u.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }, []);

  const { data: libraryItems = [] } = useQuery({
    queryKey: ['library'],
    queryFn: () => base44.entities.AppLibrary.filter({ status: 'active' }),
  });

  const { data: userEntries = [] } = useQuery({
    queryKey: ['user-entries'],
    queryFn: () => base44.entities.UserEntry.filter({ status: 'active' }),
  });

  // Query for active 21-day Neurocycle — replacement thought gets pinned to dashboard
  const { data: activeCycle } = useQuery({
    queryKey: ['neurocycle-active'],
    queryFn: async () => {
      const checkIns = await base44.entities.NeurocycleCheckIn.filter({ cycle_status: 'active' }, '-cycle_date');
      if (checkIns.length === 0) return null;
      const day1 = checkIns.find(c => c.cycle_day === 1) || checkIns[checkIns.length - 1];
      const startDate = new Date(day1.cycle_date);
      const currentDay = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)) + 1;
      if (currentDay > 21) return null;
      return {
        replacementThought: day1.replacement_thought || day1.reconceptualized_thought,
        focusThought: day1.focus_thought || day1.captured_thought,
        day: currentDay,
      };
    },
  });

  const greeting = getGreeting();
  const SessionIcon = sessionIcons[greeting.session];
  const [skipToDelivery, setSkipToDelivery] = useState(false);

  const christianEnabled = user?.christian_content || false;
  const selectedCategories = (() => {
    if (!user?.selected_categories) return [];
    try { return JSON.parse(user.selected_categories); } catch { return []; }
  })();

  const handleDashboardRefresh = () => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['library'] }),
      queryClient.invalidateQueries({ queryKey: ['user-entries'] }),
      queryClient.invalidateQueries({ queryKey: ['neurocycle-active'] }),
    ]);
  };

  return (
    <>
    <AnimatePresence>
      {showBirthdayBanner && <BirthdayBanner onComplete={() => setShowBirthdayBanner(false)} />}
    </AnimatePresence>
    <PullToRefresh onRefresh={handleDashboardRefresh}>
      <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
        {/* Grace period warning banner */}
        {user?.subscription_status === 'grace_period' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl border border-primary/40 bg-primary/10"
          >
            <p className="text-sm font-semibold text-primary mb-1">
              Payment failed — your account is in a grace period.
            </p>
            <p className="text-xs text-foreground/70">
              Manage your subscription in the same mobile store where you originally purchased it.
            </p>
          </motion.div>
        )}

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <SessionIcon className="w-4 h-4" style={{ color: '#d4830a' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#d4830a' }}>
              {greeting.session} delivery
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold" style={{ color: '#2c1e0f' }}>
            {greeting.text}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: '#7a5c3a' }}>
            {user?.full_name
              ? `Here's what's waiting for you, ${user.full_name.split(' ')[0]}.`
              : "Here's what's waiting for you today."}
          </p>
        </motion.div>

        {/* Streak */}
        <StreakCounter entries={userEntries} />

        {/* 21-Day Neurocycle — pinned replacement thought */}
        {activeCycle && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #5C3B8F 0%, #219EBC 100%)',
              boxShadow: '0 4px 20px rgba(92,59,143,0.2)',
            }}
          >
            <div className="p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  21-Day Nurture
                </span>
                <span className="text-[10px] font-medium opacity-60">
                  Day {activeCycle.day} of 21
                </span>
              </div>
              <p className="text-lg font-semibold leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
                {activeCycle.replacementThought}
              </p>
              <div className="mt-3 h-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/60 transition-all"
                  style={{ width: `${(activeCycle.day / 21) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Delivery or Evening Prompt */}
         {greeting.session === 'evening' && !skipToDelivery ? (
           <EveningPrompt 
             christianEnabled={christianEnabled}
             onSkip={() => setSkipToDelivery(true)}
           />
         ) : (
           <DeliverySession
             libraryItems={libraryItems}
             userEntries={userEntries}
             categories={selectedCategories}
             christianEnabled={christianEnabled}
           />
         )}

        {/* Quick add */}
        
      </div>
    </PullToRefresh>
    </>
  );
}