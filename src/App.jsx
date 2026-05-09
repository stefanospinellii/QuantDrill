import { Toaster } from "@/components/ui/toaster"
import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import PageNotFound from './lib/PageNotFound';
import SplashScreen from '@/components/SplashScreen';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import Home from '@/pages/Home';
import Drill from '@/pages/Drill';
import Results from '@/pages/Results';
import Progress from '@/pages/Progress';
import Badges from '@/pages/Badges';
import Paywall from '@/pages/Paywall';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // auth_required just means the user is not logged in — still render routes
  // so unauthenticated users see the landing page at /
  if (authError?.type === 'auth_required') {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Landing />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/badges" element={<Badges />} />
        </Route>
        <Route path="/drill" element={<PageTransition><Drill /></PageTransition>} />
        <Route path="/results" element={<PageTransition><Results /></PageTransition>} />
        <Route path="/paywall" element={<PageTransition><Paywall /></PageTransition>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <SplashScreen onDone={() => setSplashDone(true)} />
        {splashDone && (
          <Router>
            <AuthenticatedApp />
          </Router>
        )}
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;