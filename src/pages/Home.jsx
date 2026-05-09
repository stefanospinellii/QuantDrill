import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Flame, Zap, Settings, ChevronRight } from 'lucide-react';
import { hasCompletedTodaysSprint, isStreakAlive } from '@/lib/streakUtils';
import SettingsModal from '@/components/SettingsModal';
import DifficultySheet from '@/components/DifficultySheet';
import CategoryCards from '@/components/CategoryCards';
import { getDrillAccess } from '@/lib/freemium';
import BenchmarkMetrics from '@/components/BenchmarkMetrics';
import DailyLimitModal from '@/components/DailyLimitModal';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [diffSheetOpen, setDiffSheetOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const s = await base44.entities.Session.list('-created_date', 20);
        setSessions(s);
      } catch (e) {}
      finally { setLoading(false); }
    }
    load();
  }, []);

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
      className="min-h-screen bg-background px-5 pb-8 flex flex-col gap-6"
      style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))' }}
    >
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between">
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
        <CategoryCards difficulty="medium" />
      </motion.div>

      {/* ── Modals ── */}
      <DailyLimitModal open={limitModalOpen} onClose={() => setLimitModalOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <DifficultySheet
        open={diffSheetOpen}
        value="medium"
        category="daily"
        onClose={() => setDiffSheetOpen(false)}
        onStart={({ difficulty, duration, category }) => {
          navigate(`/drill?difficulty=${difficulty}&category=${category}&duration=${duration}`);
        }}
      />
    </div>
  );
}