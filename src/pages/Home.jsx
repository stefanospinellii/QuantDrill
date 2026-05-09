import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Flame, Zap, Settings, ChevronRight } from 'lucide-react';
import { hasCompletedTodaysSprint, isStreakAlive } from '@/lib/streakUtils';
import { useAuth } from '@/lib/AuthContext';

import DifficultySheet from '@/components/DifficultySheet';
import CategoryCards from '@/components/CategoryCards';
import { getDrillAccess } from '@/lib/freemium';
import BenchmarkMetrics from '@/components/BenchmarkMetrics';
import DailyLimitModal from '@/components/DailyLimitModal';
import LoginScreen from '@/components/LoginScreen';
import SettingsModal from '@/components/SettingsModal';

export default function Home() {
  const navigate = useNavigate();
  const { refetchUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [diffSheetOpen, setDiffSheetOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingDrillSettings, setPendingDrillSettings] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Check if returning from Stripe checkout
        const paymentParam = searchParams.get('payment');
        if (paymentParam === 'success') {
          // Refetch user to sync is_premium from backend
          const u = await refetchUser();
          setUser(u);
        } else {
          const u = await base44.auth.me();
          setUser(u);
        }
        if (user?.id) {
          const s = await base44.entities.Session.filter({ user_id: user.id }, '-created_date', 20);
          setSessions(s);
        }
      } catch (e) {}
      finally { setLoading(false); }
    }
    load();
  }, [refetchUser, searchParams, user?.id]);

  const lastActive = user?.last_active_date;
  const streakAlive = isStreakAlive(lastActive);
  const completedToday = hasCompletedTodaysSprint(lastActive);
  const { allowed: drillAllowed, remaining, isPremium } = getDrillAccess(sessions, user);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background px-5 lg:px-0 pb-8 flex flex-col gap-6 lg:max-w-3xl lg:mx-auto lg:w-full"
      style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))' }}
    >
      {/* ── Header (mobile only, desktop settings in sidebar) ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between lg:hidden">
          <h1 className="text-2xl font-grotesk font-bold text-foreground tracking-tight">
            Quant<span className="text-neon-purple">Drill</span>
          </h1>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-9 h-9 bg-surface-2 rounded-xl flex items-center justify-center border border-border hover:border-primary transition-colors no-select"
          >
            <Settings size={16} className="text-muted-foreground" />
          </button>
        </div>
        <div className="hidden lg:block">
          <h1 className="text-2xl font-grotesk font-bold text-foreground tracking-tight">
            Quant<span className="text-neon-purple">Drill</span>
          </h1>
        </div>
      </motion.div>

      {/* ── Streak bar ── */}
      {(user?.streak_count > 0 || completedToday) && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${
            streakAlive
              ? 'bg-orange-500/10 border-orange-500/20'
              : 'bg-surface-2 border-border'
          }`}
        >
          <Flame size={16} className={streakAlive ? 'text-neon-orange' : 'text-muted-foreground'} />
          <span className={`text-sm font-grotesk font-bold ${streakAlive ? 'text-neon-orange' : 'text-muted-foreground'}`}>
            {user?.streak_count || 1} day streak
          </span>
          {completedToday && (
            <span className="ml-auto text-[10px] font-medium text-emerald-400 uppercase tracking-widest">✓ Today</span>
          )}
        </motion.div>
      )}

      {/* ── Benchmark Metrics ── */}
      <BenchmarkMetrics sessions={sessions} />

      {/* ── Completed today banner ── */}
      {completedToday && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-2 border border-neon-cyan/20 rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-neon-cyan/10 flex items-center justify-center">
            <Zap size={16} className="text-neon-cyan" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Drill Complete!</p>
            <p className="text-xs text-muted-foreground">You've trained today. Keep the streak alive.</p>
          </div>
        </motion.div>
      )}

      {/* ── Daily Drill CTA (Primary) ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        {/* Big CTA */}
        <button
          onClick={() => drillAllowed ? setDiffSheetOpen(true) : setLimitModalOpen(true)}
          className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-lg py-5 rounded-2xl glow-purple transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 no-select"
        >
          <Zap size={22} />
          {completedToday ? 'Train Now' : 'Start Daily Drill'}
          <ChevronRight size={20} />
        </button>
        <p className="text-center text-xs text-muted-foreground mt-2.5">
          {isPremium ? 'Tap to choose difficulty & duration' : 'Tap to start your daily drill'}
        </p>
      </motion.div>

      {/* ── Focused Practice ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
        <CategoryCards
        difficulty="medium"
        user={user}
        onNeedsAuth={!user ? (settings) => {
          setPendingDrillSettings(settings);
          setLoginModalOpen(true);
        } : undefined}
      />
      </motion.div>

      {/* ── Upgrade CTA (free users only) ── */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-[#7C3AED]/40 bg-[#7C3AED]/10"
        >
          <p className="text-xs text-foreground leading-snug flex-1">
            <span className="font-bold text-[#a78bfa]">Unlock Pro</span> — unlimited drills, all categories, hard mode
          </p>
          <button
            onClick={() => navigate('/paywall')}
            className="shrink-0 bg-[#7C3AED] text-white font-grotesk font-bold text-xs px-3 py-2 rounded-xl no-select active:scale-95 transition-transform"
          >
            Upgrade Now
          </button>
        </motion.div>
      )}

      {/* ── Modals ── */}
      <DailyLimitModal open={limitModalOpen} onClose={() => setLimitModalOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {loginModalOpen && (
        <LoginScreen
          onAuthenticated={async () => {
            await base44.auth.me().catch(() => {});
            setLoginModalOpen(false);
            if (pendingDrillSettings) {
              const { difficulty, duration, category } = pendingDrillSettings;
              setPendingDrillSettings(null);
              navigate(`/drill?difficulty=${difficulty}&category=${category}&duration=${duration}`);
            }
          }}
        />
      )}

      <DifficultySheet
        open={diffSheetOpen}
        value="medium"
        category="daily"
        user={user}
        onClose={() => setDiffSheetOpen(false)}
        onNeedsAuth={!user ? (settings) => {
          setDiffSheetOpen(false);
          setPendingDrillSettings(settings);
          setLoginModalOpen(true);
        } : undefined}
        onStart={({ difficulty, duration, category }) => {
          navigate(`/drill?difficulty=${difficulty}&category=${category}&duration=${duration}`);
        }}
      />
    </div>
  );
}