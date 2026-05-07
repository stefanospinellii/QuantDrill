import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Clock, BarChart2, Flame, RotateCcw, Home } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';

export default function Results() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    navigate('/');
    return null;
  }

  const { score, accuracy, avgTime, speedRating, percentile, difficulty, correct, total } = state;

  const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[difficulty];

  const scoreColor =
    score >= 80 ? 'text-neon-cyan' :
    score >= 60 ? 'text-neon-purple' :
    score >= 40 ? 'text-neon-orange' : 'text-red-400';

  const scoreGlow =
    score >= 80 ? 'glow-cyan' :
    score >= 60 ? 'glow-purple' : '';

  return (
    <div className="min-h-screen bg-background pb-8 flex flex-col">
      <MobileHeader title="Results" onBack={() => navigate('/')} />
      <div className="flex-1 flex flex-col px-5 pt-6">
      {/* Score Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center mb-10"
      >
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-4">Drill Complete</p>
        <div className={`relative w-36 h-36 rounded-full bg-surface-2 border-2 border-border ${scoreGlow} flex items-center justify-center mb-5`}>
          <div className="text-center">
            <span className={`text-5xl font-grotesk font-black tabular-nums ${scoreColor}`}>{score}</span>
            <span className="text-lg text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{difficultyLabel} Mode</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span className={`text-sm font-semibold ${scoreColor}`}>{speedRating}</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <ResultStat icon={<Target size={18} className="text-neon-purple" />} label="Accuracy" value={`${accuracy}%`} sub={`${correct}/${total} correct`} />
        <ResultStat icon={<Clock size={18} className="text-neon-cyan" />} label="Avg Time" value={`${avgTime}s`} sub="per question" />
        <ResultStat icon={<BarChart2 size={18} className="text-neon-orange" />} label="Percentile" value={`Top ${100 - percentile}%`} sub="estimated ranking" />
        <ResultStat icon={<Flame size={18} className="text-red-400" />} label="Difficulty" value={difficultyLabel} sub="mode played" />
      </motion.div>

      {/* Speed badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="bg-surface-2 border border-border rounded-2xl px-5 py-4 mb-8 flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Performance Rating</p>
          <p className="text-xl font-grotesk font-bold text-foreground">{speedRating}</p>
        </div>
        <div className="text-4xl">
          {score >= 80 ? '🏆' : score >= 60 ? '🔥' : score >= 40 ? '⚡' : '📈'}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-auto flex flex-col gap-3"
      >
        <button
          onClick={() => navigate(`/drill?difficulty=${difficulty}`)}
          className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-base py-4 rounded-2xl glow-purple transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} /> Drill Again
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-surface-2 border border-border text-foreground font-semibold text-base py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Home size={18} /> Return Home
        </button>
      </motion.div>
      </div>
    </div>
  );
}

function ResultStat({ icon, label, value, sub }) {
  return (
    <div className="bg-surface-2 border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span></div>
      <p className="text-xl font-grotesk font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}