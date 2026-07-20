import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import Landing from '@/pages/Landing';
import Disclaimer from '@/pages/Disclaimer';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import Onboarding from '@/pages/Onboarding';
import Paywall from '@/pages/Paywall';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import DeleteAccount from '@/pages/DeleteAccount';
import Dashboard from '@/pages/Dashboard';
import AddEntry from '@/pages/AddEntry';
import Vault from '@/pages/Vault';
import Milestones from '@/pages/Milestones';
import Accomplishments from '@/pages/Accomplishments';
import Affirmations from '@/pages/Affirmations';
import Scriptures from '@/pages/Scriptures';
import MicroStories from '@/pages/MicroStories';
import Blessings from '@/pages/Blessings';
import PowerUps from '@/pages/PowerUps';
import NeuralTraining from '@/pages/NeuralTraining';
import Reset from '@/pages/Reset';
import FocusTriage from '@/pages/FocusTriage';
import ComingSoon from '@/pages/ComingSoon';
import BoxBreath from '@/pages/exercises/BoxBreath';
import Breathe from '@/pages/exercises/Breathe';
import FocusEx from '@/pages/exercises/Focus';
import Sigh from '@/pages/exercises/Sigh';
import SmileEx from '@/pages/exercises/Smile';
import RewireIn60 from '@/pages/exercises/RewireIn60';
import InstinctVsInsight from '@/pages/exercises/InstinctVsInsight';
import Neurocycle from '@/pages/exercises/Neurocycle';
import IntentionTimer from '@/pages/exercises/IntentionTimer';
import ImpactPrioritization from '@/pages/exercises/ImpactPrioritization';
import Notes from '@/pages/Notes';
import IdentityUpgrades from '@/pages/IdentityUpgrades';
import Search from '@/pages/Search';
import Settings from '@/pages/Settings';
import Admin from '@/pages/Admin';
import Reflections from '@/pages/Reflections';
import ElevateReflection from '@/pages/ElevateReflection';
import VisionGoals from '@/pages/VisionGoals';
import AppLayout from '@/components/layout/AppLayout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/delete-account" element={<DeleteAccount />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/paywall" element={<Paywall />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-entry" element={<AddEntry />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/accomplishments" element={<Accomplishments />} />
          <Route path="/affirmations" element={<Affirmations />} />
          <Route path="/scriptures" element={<Scriptures />} />
          <Route path="/micro-stories" element={<MicroStories />} />
          <Route path="/blessings" element={<Blessings />} />
          <Route path="/power-ups" element={<PowerUps />} />
          <Route path="/quotes" element={<PowerUps />} />
          <Route path="/neural-training" element={<NeuralTraining />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/focus-triage" element={<FocusTriage />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/identity-upgrades" element={<IdentityUpgrades />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reflections" element={<Reflections />} />
          <Route path="/elevate-reflection" element={<ElevateReflection />} />
          <Route path="/vision-goals" element={<VisionGoals />} />
        </Route>

        {/* Full-screen exercise routes — outside AppLayout for immersive experience */}
        <Route path="/exercises/box-breath" element={<BoxBreath />} />
        <Route path="/exercises/breathe" element={<Breathe />} />
        <Route path="/exercises/focus" element={<FocusEx />} />
        <Route path="/exercises/sigh" element={<Sigh />} />
        <Route path="/exercises/smile" element={<SmileEx />} />
        <Route path="/exercises/rewire-in-60" element={<RewireIn60 />} />
        <Route path="/exercises/instinct-vs-insight" element={<InstinctVsInsight />} />
        <Route path="/exercises/neurocycle" element={<Neurocycle />} />
        <Route path="/exercises/intention-timer" element={<IntentionTimer />} />
        <Route path="/exercises/impact-prioritization" element={<ImpactPrioritization />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App