import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, TrendingUp, Zap, Target, Clock, Lock } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';
import { CATEGORY_LABELS } from '@/lib/badges';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['mental_math', 'percentages_growth', 'business_math', 'market_sizing', 'gmat_quant'];

export default function Progress() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([
        base44.auth.me(),
        base44.entities.Session.list('-date', 200),
      ]);
      setUser(u);
      setSessions(s);
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { containerRef, pullDistance, isRefreshing, handlers } = usePullToRefresh(load);

  const isPremium = user?.is_premium === true;

  // Last 7 days chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = d.toISOString().split('T')[0];
    const daySessions = sessions.filter(s => s.date === dateStr);
    const best = daySessions.length ? Math.max(...daySessions.map(s => s.score)) : null;
    return { day: format(d, 'EEE'), score: best };
  });

  const recent7 = sessions.slice(0, 7);
  const avgScore = recent7.length
    ? Math.round(recent7.reduce((s, r) => s + r.score, 0) / recent7.length)
    : 0;
  const completedDays = last7.filter(d => d.score !== null).length;

  // Category stats
  const catStats = CATEGORIES.map(cat => {
    const catSessions = sessions.filter(s => s.category === cat);
    const avgAcc = catSessions.length
      ? Math.round(catSessions.reduce((s, r) => s + (r.accuracy || 0), 0) / catSessions.length)
      : null;
    const avgSpeed = catSessions.length
      ? parseFloat((catSessions.reduce((s, r) => s + (r.avg_time || 0), 0) / catSessions.length).toFixed(1))
      : null;
    const best = catSessions.length ? Math.max(...catSessions.map(s => s.score)) : null;

    // Improvement: compare first 3 vs last 3 sessions
    let improvement = null;
    if (catSessions.length >= 6) {
      const sorted = [...catSessions].sort((a, b) => a.date > b.date ? 1 : -1);
      const first3 = sorted.slice(0, 3).reduce((s, r) => s + r.score, 0) / 3;
      const last3 = sorted.slice(-3).reduce((s, r) => s + r.score, 0) / 3;
      improvement = Math.round(last3 - first3);
    }

    return { cat, count: catSessions.length, avgAcc, avgSpeed, best, improvement };
  }).filter(c => c.count > 0);

  const strongest = catStats.length ? catStats.reduce((a, b) => (b.best || 0) > (a.best || 0) ? b : a) : null;
  const weakest = catStats.length > 1 ? catStats.reduce((a, b) => (b.best || 0) < (a.best || 0) ? b : a) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background px-5 pt-10 pb-6 overflow-y-auto" {...handlers}>
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-grotesk font-bold text-foreground mb-1">Progress</h2>
        <p className="text-sm text-muted-foreground mb-6">Your quantitative performance over time</p>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3 mb-6">
        <MiniStat icon={<Flame size={16} className="text-neon-orange" />} label="Streak" value={`${user?.streak_count || 0}d`} />
        <MiniStat icon={<Target size={16} className="text-neon-purple" />} label="Avg Score" value={avgScore || '—'} sub="last 7 sessions" />
        <MiniStat icon={<Zap size={16} className="text-neon-cyan" />} label="This Week" value={`${completedDays}/7`} sub="days trained" />
        <MiniStat icon={<TrendingUp size={16} className="text-emerald-400" />} label="Total Drills" value={sessions.length} sub="all time" />
      </motion.div>

      {/* Strongest / Weakest */}
      {(strongest || weakest) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 gap-3 mb-6">
          {strongest && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Strongest</p>
              <p className="text-sm font-grotesk font-bold text-emerald-400 leading-tight">{CATEGORY_LABELS[strongest.cat]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Best: {strongest.best}/100</p>
            </div>
          )}
          {weakest && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Focus Area</p>
              <p className="text-sm font-grotesk font-bold text-red-400 leading-tight">{CATEGORY_LABELS[weakest.cat]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Best: {weakest.best}/100</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Score chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface-1 border border-border rounded-3xl p-5 mb-5">
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-5">Best Score — Last 7 Days</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={last7} barSize={24}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220 10% 50%)', fontSize: 11 }} />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{ background: 'hsl(220 18% 9%)', border: '1px solid hsl(220 15% 16%)', borderRadius: 12, color: '#fff', fontSize: 12 }}
              formatter={(v) => [v !== null ? `${v}/100` : 'No session', 'Score']}
            />
            <Bar dataKey="score" fill="hsl(262 83% 68%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category breakdown */}
      {catStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mb-6">
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-3">By Category</p>
          <div className="space-y-2.5">
            {catStats.map(({ cat, count, avgAcc, avgSpeed, best, improvement }) => (
              <div key={cat} className="bg-surface-2 border border-border rounded-2xl px-4 py-3.5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">{CATEGORY_LABELS[cat]}</p>
                  <span className="text-2xl font-grotesk font-black tabular-nums text-neon-purple">{best ?? '—'}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xs text-muted-foreground">{count} drill{count !== 1 ? 's' : ''}</p>
                  {avgAcc !== null && (
                    <div className="flex items-center gap-1">
                      <Target size={10} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{avgAcc}% acc</p>
                    </div>
                  )}
                  {avgSpeed !== null && isPremium && (
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{avgSpeed}s avg</p>
                    </div>
                  )}
                  {improvement !== null && isPremium && (
                    <p className={`text-xs font-semibold ${improvement >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {improvement >= 0 ? '+' : ''}{improvement} trend
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Advanced Analytics upsell for free users */}
      {!isPremium && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <button
            onClick={() => navigate('/paywall')}
            className="w-full bg-surface-2 border border-primary/20 rounded-2xl px-4 py-4 flex items-center justify-between mb-6 no-select"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock size={14} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Advanced Analytics</p>
                <p className="text-xs text-muted-foreground">Speed trends, improvement tracking</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">Unlock →</span>
          </button>
        </motion.div>
      )}

      {/* Recent sessions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-3">Recent Sessions</p>
        {sessions.length === 0 ? (
          <div className="bg-surface-1 border border-border rounded-2xl p-6 text-center">
            <p className="text-muted-foreground text-sm">No sessions yet. Start your first drill!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 10).map((s, i) => <SessionRow key={s.id || i} session={s} />)}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function MiniStat({ icon, label, value, sub, highlight }) {
  return (
    <div className={`rounded-2xl p-4 border ${highlight ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-surface-2 border-border'}`}>
      <div className="flex items-center gap-1.5 mb-1.5">{icon}<span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span></div>
      <p className={`text-xl font-grotesk font-bold ${highlight ? 'text-emerald-400' : 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function SessionRow({ session }) {
  const scoreColor = session.score >= 80 ? 'text-neon-cyan' : session.score >= 60 ? 'text-neon-purple' : 'text-neon-orange';
  const diffLabel = { easy: 'E', medium: 'M', hard: 'H' }[session.difficulty] || 'M';
  const diffColor = { easy: 'bg-emerald-500/20 text-emerald-400', medium: 'bg-primary/20 text-primary', hard: 'bg-red-500/20 text-red-400' }[session.difficulty] || '';
  const catLabel = CATEGORY_LABELS[session.category] || '🔀 Daily Mix';

  return (
    <div className="bg-surface-2 border border-border rounded-2xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${diffColor}`}>{diffLabel}</span>
        <div>
          <p className="text-sm font-medium text-foreground">{catLabel}</p>
          <p className="text-xs text-muted-foreground">{session.date} · {session.accuracy}% acc</p>
        </div>
      </div>
      <span className={`text-xl font-grotesk font-black tabular-nums ${scoreColor}`}>{session.score}</span>
    </div>
  );
}