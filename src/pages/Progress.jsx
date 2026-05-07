import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Clock, Target } from 'lucide-react';

const CATEGORIES = [
  { key: 'mental_math', label: 'Mental Math', emoji: '🧮' },
  { key: 'percentages_growth', label: 'Percentages', emoji: '📈' },
  { key: 'business_math', label: 'Business Math', emoji: '💼' },
  { key: 'market_sizing', label: 'Market Sizing', emoji: '🌍' },
  { key: 'gmat_quant', label: 'GMAT Quant', emoji: '🎓' },
];

export default function Progress() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    base44.entities.Session.list('-created_date', 50)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalSessions = sessions.length;
  const avgScore = totalSessions ? Math.round(sessions.reduce((s, x) => s + (x.score || 0), 0) / totalSessions) : 0;
  const avgAccuracy = totalSessions ? Math.round(sessions.reduce((s, x) => s + (x.accuracy || 0), 0) / totalSessions) : 0;

  const categoryStats = CATEGORIES.map(cat => {
    const catSessions = sessions.filter(s => s.category === cat.key);
    const count = catSessions.length;
    const avg = count ? Math.round(catSessions.reduce((s, x) => s + (x.score || 0), 0) / count) : null;
    const accuracy = count ? Math.round(catSessions.reduce((s, x) => s + (x.accuracy || 0), 0) / count) : null;
    return { ...cat, count, avg, accuracy };
  });

  return (
    <div
      className="min-h-screen bg-background px-5 pb-8 flex flex-col gap-6"
      style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))' }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-grotesk font-bold text-foreground tracking-tight"
      >
        Progress
      </motion.h1>

      {/* Tabs */}
      <div className="flex bg-surface-2 rounded-xl p-1 gap-1">
        {['overview', 'categories', 'sessions'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all no-select ${
              tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<BarChart2 size={16} className="text-neon-purple" />} label="Total Sessions" value={totalSessions} color="purple" />
            <StatCard icon={<TrendingUp size={16} className="text-neon-cyan" />} label="Avg Score" value={avgScore} color="cyan" />
            <StatCard icon={<Target size={16} className="text-neon-orange" />} label="Avg Accuracy" value={`${avgAccuracy}%`} color="orange" />
            <StatCard icon={<Clock size={16} className="text-neon-purple" />} label="Best Score" value={sessions.length ? Math.max(...sessions.map(s => s.score || 0)) : '—'} color="purple" />
          </div>
        </motion.div>
      )}

      {tab === 'categories' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
          {categoryStats.map(cat => (
            <div key={cat.key} className="bg-surface-2 border border-border rounded-2xl p-4 flex items-center gap-4">
              <span className="text-2xl">{cat.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                <p className="text-xs text-muted-foreground">{cat.count} sessions</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-grotesk font-bold text-neon-purple">{cat.avg ?? '—'}</p>
                <p className="text-[10px] text-muted-foreground">avg score</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {tab === 'sessions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
          {sessions.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No sessions yet. Start drilling!</p>
          )}
          {sessions.map((s, i) => (
            <div key={s.id || i} className="bg-surface-2 border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground capitalize">{(s.category || 'daily').replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">{s.date} · {s.difficulty}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-grotesk font-bold text-neon-cyan">{Math.round(s.score || 0)}</p>
                <p className="text-[10px] text-muted-foreground">{Math.round(s.accuracy || 0)}% acc</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    purple: 'border-primary/20 bg-primary/5',
    cyan: 'border-neon-cyan/20 bg-neon-cyan/5',
    orange: 'border-orange-500/20 bg-orange-500/5',
  };
  return (
    <div className={`rounded-2xl p-4 border ${colors[color] || 'border-border bg-surface-2'}`}>
      <div className="flex items-center gap-1.5 mb-2">{icon}<span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span></div>
      <p className="text-2xl font-grotesk font-bold text-foreground">{value}</p>
    </div>
  );
}