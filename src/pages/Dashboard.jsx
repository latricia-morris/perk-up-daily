import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { PlusCircle, Sun, CloudSun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGreeting } from '@/lib/constants';
import DeliverySession from '@/components/dashboard/DeliverySession';
import EveningPrompt from '@/components/dashboard/EveningPrompt';
import StreakCounter from '@/components/dashboard/StreakCounter';
import PullToRefresh from '@/components/PullToRefresh';

const sessionIcons = {
  morning: Sun,
  midday: CloudSun,
  evening: Moon,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      // Gate: cancelled or expired users must subscribe
      if (u.subscription_status === 'cancelled' || u.subscription_status === 'expired') {
        window.location.href = '/paywall';
        return;
      }

      setUser(u);

      // Apply onboarding prefs if not yet set
      if (!u.onboarding_completed) {
        const prefs = localStorage.getItem('perkup-onboarding');
        const { christianContent, selectedCategories } = prefs ? JSON.parse(prefs) : {};
        base44.auth.updateMe({
          christian_content: christianContent || false,
          selected_categories: JSON.stringify(selectedCategories || []),
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
    ]);
  };

  return (
    <PullToRefresh onRefresh={handleDashboardRefresh}>
      <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
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
        <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40">
          <Link to="/add-entry">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 rounded-full w-14 h-14 shadow-lg"
            >
              <PlusCircle className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>
    </PullToRefresh>
  );
}