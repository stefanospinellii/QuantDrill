import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Home, Target, Clock, Zap, BarChart2 } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import { CATEGORY_LABELS } from '@/lib/badges';

export default function Results() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    navigate('/');
    return null;
  }

  const { score, accuracy, avgTime, speedRating, speedPercentile, difficulty, correct, total, category, durationMinutes } = state;

  const diffLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[difficulty] || 'Medium';
  const catLabel = CATEGORY_LABELS[category] || '🔀 Daily Mix';

  const accuracyColor = accuracy >= 80 ? 'text-neon-cyan' : accuracy >= 60 ? 'text-neon-purple' : 'text-neon-orange';
  const speedColor = speedPercentile >= 70 ? 'text-neon-cyan' : speedPercentile >= 40 ? 'text-neon-purple' : 'text-neon-orange';

  return (
    <div className="min-h-screen bg-background flex flex-col pb-8">
      <MobileHeader title="" onBack={() => navigate('/')} />

      <div className="flex-1 flex flex-col px-5 pt-6">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-1">Session Complete</p>
          <p className="text-sm text-muted-foreground">{catLabel} · {diffLabel} · {durationMinutes ?? 5} min</p>
        </motion.div>

        {/* Two primary circular metrics */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <MetricCircle
            value={`${accuracy}%`}
            label="Accuracy"
            sub={`${correct} of ${total} correct`}
            color={accuracyColor}
            glow={accuracy >= 80 ? 'glow-cyan' : accuracy >= 60 ? 'glow-purple' : ''}
          />
          <MetricCircle
            value={`${speedPercentile}%`}
            label="Speed Rank"
            sub={`Faster than ${speedPercentile}% of candidates`}
            color={speedColor}
            glow={speedPercentile >= 70 ? 'glow-cyan' : ''}
          />
        </motion.div>

        {/* Performance label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-2 border border-border rounded-2xl px-5 py-4 mb-6 flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Performance Rating</p>
            <p className="text-xl font-grotesk font-bold text-foreground">{speedRating}</p>
          </div>
          <div className="text-3xl">
            {accuracy >= 85 ? '🏆' : accuracy >= 70 ? '🔥' : accuracy >= 50 ? '⚡' : '📈'}
          </div>
        </motion.div>

        {/* Session Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="bg-surface-1 border border-border rounded-2xl px-4 py-4 mb-8 space-y-3"
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Session Breakdown</p>
          <BreakdownRow icon={<Target size={14} className="text-neon-purple" />} label="Questions Answered" value={total} />
          <BreakdownRow icon={<Zap size={14} className="text-emerald-400" />} label="Correct Answers" value={`${correct} (${accuracy}%)`} />
          <BreakdownRow icon={<Clock size={14} className="text-neon-cyan" />} label="Avg Response Time" value={`${avgTime}s per question`} />
          <BreakdownRow icon={<BarChart2 size={14} className="text-neon-orange" />} label="Difficulty" value={diffLabel} />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mt-auto flex flex-col gap-3"
        >
          <button
            onClick={() => navigate(`/session?category=${category}&difficulty=${difficulty}&duration=${durationMinutes || 5}`)}
            className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-base py-4 rounded-2xl glow-purple transition-all active:scale-95 no-select flex items-center justify-center gap-2"
          >
            <RotateCcw size={17} /> Train Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-surface-2 border border-border text-foreground font-semibold text-base py-4 rounded-2xl transition-all active:scale-95 no-select flex items-center justify-center gap-2"
          >
            <Home size={17} /> Return Home
          </button>
        </motion.div>

      </div>
    </div>
  );
}

function MetricCircle({ value, label, sub, color, glow }) {
  return (
    <div className={`bg-surface-2 border border-border ${glow} rounded-3xl flex flex-col items-center justify-center py-6 px-3 text-center`}>
      <p className={`text-3xl font-grotesk font-black tabular-nums leading-none mb-2 ${color}`}>{value}</p>
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{sub}</p>
    </div>
  );
}

function BreakdownRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}