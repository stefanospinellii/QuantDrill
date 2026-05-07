import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, TrendingUp, Zap, Target } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';

export default function Progress() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([
        base44.auth.me(),
        base44.entities.Session.list('-date', 30),
      ]);
      setUser(u);
      setSessions(s);
    } catch (e) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { containerRef, pullDistance, isRefreshing, handlers } = usePullToRefresh(load);

  // Build last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = d.toISOString().split('T')[0];
    const session = sessions.find(s => s.date === dateStr);
    return {
      day: format(d, 'EEE'),
      score: session?.score ?? null,
      accuracy: session?.accuracy ?? null,
    };
  });

  const completedDays = last7.filter(d => d.score !== null).length;
  const avgScore = sessions.length
    ? Math.round(sessions.slice(0, 7).reduce((s, r) => s + r.score, 0) / Math.min(sessions.length, 7))
    : 0;

  const prevWeek = sessions.slice(7, 14);
  const thisWeek = sessions.slice(0, 7);
  const improvement = prevWeek.length && thisWeek.length
    ? Math.round(
        ((thisWeek.reduce((s, r) => s + r.avg_time, 0) / thisWeek.length) -
         (prevWeek.reduce((s, r) => s + r.avg_time, 0) / prevWeek.length)) * -10
      )
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background px-5 pt-10 pb-6 overflow-y-auto"
      {...handlers}
    >
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-grotesk font-bold text-foreground mb-1">Progress</h2>
        <p className="text-sm text-muted-foreground mb-8">Your personal training over the last 7 days</p>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-3 mb-8">
        <MiniStat icon={<Flame size={16} className="text-neon-orange" />} label="Streak" value={`${user?.streak_count || 0}d`} />
        <MiniStat icon={<Target size={16} className="text-neon-purple" />} label="Avg Score" value={avgScore || '—'} />
        <MiniStat icon={<Zap size={16} className="text-neon-cyan" />} label="This Week" value={`${completedDays}/7`} sub="days trained" />
        <MiniStat
          icon={<TrendingUp size={16} className="text-emerald-400" />}
          label="Speed Trend"
          value={improvement !== null ? `${improvement > 0 ? '+' : ''}${improvement}%` : '—'}
          sub={improvement !== null ? 'vs last week' : 'not enough data'}
          highlight={improvement !== null && improvement > 0}
        />
      </motion.div>

      {/* Score Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface-1 border border-border rounded-3xl p-5 mb-5">
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-5">Score — Last 7 Days</p>
        <ResponsiveContainer width="100%" height={160}>
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

      {/* Recent sessions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-3">Recent Sessions</p>
        {sessions.length === 0 ? (
          <div className="bg-surface-1 border border-border rounded-2xl p-6 text-center">
            <p className="text-muted-foreground text-sm">No sessions yet. Start your first sprint!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 10).map((s, i) => (
              <SessionRow key={s.id || i} session={s} />
            ))}
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

  return (
    <div className="bg-surface-2 border border-border rounded-2xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${diffColor}`}>{diffLabel}</span>
        <div>
          <p className="text-sm font-medium text-foreground">{session.date}</p>
          <p className="text-xs text-muted-foreground">{session.accuracy}% accuracy · {session.avg_time}s avg</p>
        </div>
      </div>
      <span className={`text-xl font-grotesk font-black tabular-nums ${scoreColor}`}>{session.score}</span>
    </div>
  );
}