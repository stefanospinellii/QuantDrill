import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getSessionsForUser } from '@/lib/querySafety';
import { motion } from 'framer-motion';
import { Zap, Settings } from 'lucide-react';
import { isStreakAlive, getTodayDate } from '@/lib/streakUtils';
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
        let u;
        const paymentParam = searchParams.get('payment');
        if (paymentParam === 'success') {
          u = await refetchUser();
        } else {
          u = await base44.auth.me();
        }
        setUser(u);
        if (u?.id) {
          const s = await getSessionsForUser(u.id, '-created_date', 20);
          setSessions(s);
        }
      } catch (e) {}
      finally { setLoading(false); }
    }
    load();
  }, [refetchUser, searchParams]);

  const lastActive = user?.last_active_date;
  const streakAlive = isStreakAlive(lastActive);
  const completedToday = sessions.some(s => s.date === getTodayDate());
  const { allowed: drillAllowed, remaining, isPremium } = getDrillAccess(sessions, user);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const streakCount = user?.streak_count || 0;

  return (
    <div
      className="min-h-screen bg-background px-5 lg:px-0 pb-10 flex flex-col gap-5 lg:max-w-2xl lg:mx-auto lg:w-full"
      style={{ paddingTop: 'max(40px, env(safe-area-inset-top, 40px))' }}
    >
      {/* ── Mobile Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between lg:hidden"
      >
        <h1 className="text-xl font-grotesk font-black tracking-tight text-foreground">
          Quant<span className="text-neon-purple">Drill</span>
        </h1>
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-9 h-9 bg-surface-2 rounded-xl flex items-center justify-center border border-border no-select transition-all duration-200"
          style={{ transition: 'border-color 0.2s, background 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; }}
        >
          <Settings size={15} className="text-muted-foreground" />
        </button>
      </motion.div>

      {/* ── Streak pill ── */}
      {(streakCount > 0 || completedToday) && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border self-start"
          style={streakAlive ? {
            background: 'rgba(255,153,51,0.08)',
            border: '1px solid rgba(255,153,51,0.2)',
          } : {
            background: 'hsl(220 16% 12%)',
            border: '1px solid hsl(220 15% 16%)',
          }}
        >
          <span className="text-base leading-none">🔥</span>
          <span className="text-sm font-grotesk font-bold" style={{ color: streakAlive ? '#FF9933' : 'rgba(255,255,255,0.4)' }}>
            {streakCount || 1} day streak
          </span>
          {completedToday && (
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#34D399' }}>✓ Today</span>
          )}
        </motion.div>
      )}

      {/* ── Benchmark Metrics ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <BenchmarkMetrics sessions={sessions} />
      </motion.div>

      {/* ── Primary Drill CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* Ambient glow behind the button */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 0,
            borderRadius: 20,
            background: completedToday
              ? 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(0,229,196,0.08) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)',
            filter: 'blur(8px)',
            transform: 'scale(1.04)',
          }}
        />
        <button
          onClick={() => drillAllowed ? setDiffSheetOpen(true) : setLimitModalOpen(true)}
          className="relative w-full font-grotesk font-bold text-white no-select overflow-hidden"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
            padding: '18px 24px',
            borderRadius: 18,
            background: completedToday
              ? 'linear-gradient(135deg, rgba(0,229,196,0.15) 0%, rgba(0,229,196,0.06) 100%)'
              : 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            border: completedToday
              ? '1px solid rgba(0,229,196,0.25)'
              : '1px solid rgba(124,58,237,0.4)',
            boxShadow: completedToday
              ? '0 0 30px rgba(0,229,196,0.1)'
              : '0 0 40px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            transition: 'all 0.22s ease',
          }}
          onMouseEnter={e => {
            if (!completedToday) {
              e.currentTarget.style.boxShadow = '0 0 55px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.12)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = completedToday
              ? '0 0 30px rgba(0,229,196,0.1)'
              : '0 0 40px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <Zap size={20} className={completedToday ? 'text-neon-cyan' : 'text-white'} />
            <span style={{ color: completedToday ? 'hsl(174 100% 45%)' : '#fff' }}>
              {completedToday ? 'Train Again' : 'Start Daily Drill'}
            </span>
            <span style={{ color: completedToday ? 'rgba(0,229,196,0.5)' : 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>→</span>
          </div>
        </button>

        {/* Status line */}
        <div className="flex items-center justify-center gap-2 mt-2.5">
          {completedToday ? (
            <p className="text-xs" style={{ color: 'rgba(52,211,153,0.7)' }}>✓ Today's session complete · Keep the streak alive</p>
          ) : (
            <p className="text-xs text-muted-foreground">Choose difficulty & duration · Track your performance</p>
          )}
        </div>
      </motion.div>

      {/* ── Category Cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <CategoryCards
          difficulty="medium"
          user={user}
          onNeedsAuth={!user ? (settings) => {
            setPendingDrillSettings(settings);
            setLoginModalOpen(true);
          } : undefined}
        />
      </motion.div>

      {/* ── Upgrade CTA (free users) ── */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl cursor-pointer no-select"
          onClick={() => navigate('/paywall')}
          style={{
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.2)',
            padding: '16px 18px',
            transition: 'all 0.22s ease',
          }}
          whileHover={{ borderColor: 'rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.1)', y: -1, transition: { duration: 0.18 } }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-grotesk font-bold" style={{ color: '#a78bfa' }}>Unlock Pro Training ⭐</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                Unlimited drills · All 6 categories · Hard mode · 200 badges
              </p>
            </div>
            <span className="text-xs font-bold shrink-0" style={{ color: '#a78bfa' }}>Upgrade →</span>
          </div>
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
              const p = new URLSearchParams({ difficulty, category, pace: 'normal' });
              if (duration) p.set('duration', duration);
              navigate(`/drill?${p.toString()}`);
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
        onStart={({ difficulty, duration, category, pace }) => {
          const params = new URLSearchParams({ difficulty, category, pace: pace || 'normal' });
          if (duration) params.set('duration', duration);
          navigate(`/drill?${params.toString()}`);
        }}
      />
    </div>
  );
}