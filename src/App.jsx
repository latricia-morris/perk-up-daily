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
import Onboarding from '@/pages/Onboarding';
import Paywall from '@/pages/Paywall';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import AddEntry from '@/pages/AddEntry';
import Vault from '@/pages/Vault';
import Milestones from '@/pages/Milestones';
import Accomplishments from '@/pages/Accomplishments';
import Affirmations from '@/pages/Affirmations';
import Scriptures from '@/pages/Scriptures';
import Memories from '@/pages/Memories';
import Blessings from '@/pages/Blessings';
import Quotes from '@/pages/Quotes';
import Notes from '@/pages/Notes';
import IdentityUpgrades from '@/pages/IdentityUpgrades';
import Search from '@/pages/Search';
import Settings from '@/pages/Settings';
import Admin from '@/pages/Admin';
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
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

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
          <Route path="/memories" element={<Memories />} />
          <Route path="/blessings" element={<Blessings />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/identity-upgrades" element={<IdentityUpgrades />} />
          <Route path="/search" element={<Search />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
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