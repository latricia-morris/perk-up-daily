import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { PlusCircle, Sun, CloudSun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGreeting } from '@/lib/constants';
import DeliverySession from '@/components/dashboard/DeliverySession';

const sessionIcons = {
  morning: Sun,
  midday: CloudSun,
  evening: Moon,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Apply onboarding prefs if not yet set
      if (!u.onboarding_completed) {
        const prefs = localStorage.getItem('perkup-onboarding');
        if (prefs) {
          const { christianContent, selectedCategories } = JSON.parse(prefs);
          base44.auth.updateMe({
            christian_content: christianContent || false,
            selected_categories: JSON.stringify(selectedCategories || []),
            onboarding_completed: true,
            subscription_status: u.subscription_status || 'trial',
            trial_start_date: u.trial_start_date || new Date().toISOString().split('T')[0],
          }).then(updated => setUser(updated));
          localStorage.removeItem('perkup-onboarding');
        }
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

  const christianEnabled = user?.christian_content || false;
  const selectedCategories = (() => {
    if (!user?.selected_categories) return [];
    try { return JSON.parse(user.selected_categories); } catch { return []; }
  })();

  return (
    <div className="md:ml-64">
      <div className="max-w-2xl mx-auto px-6 py-8 md:py-12">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <SessionIcon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              {greeting.session}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            {greeting.text}
          </h1>
          {user?.full_name && (
            <p className="text-muted-foreground mt-1 text-sm">
              Here's what's waiting for you, {user.full_name.split(' ')[0]}.
            </p>
          )}
        </motion.div>

        {/* Delivery */}
        <DeliverySession
          libraryItems={libraryItems}
          userEntries={userEntries}
          categories={selectedCategories}
          christianEnabled={christianEnabled}
        />

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
    </div>
  );
}