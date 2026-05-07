import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, RotateCcw, Home, Star, Target, Clock } from 'lucide-react';

const CATEGORY_LABELS = {
  daily: 'Daily Drill',
  mental_math: 'Mental Math',
  percentages_growth: 'Percentages & Growth',
  business_math: 'Business Math',
  market_sizing: 'Market Sizing',
  gmat_quant: 'GMAT Quant',
};

export default function Results() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0');
  const accuracy = parseInt(searchParams.get('accuracy') || '0');
  const difficulty = searchParams.get('difficulty') || 'medium';
  const category = searchParams.get('category') || 'daily';

  const getScoreColor = () => {
    if (score >= 80) return 'text-neon-cyan';
    if (score >= 60) return 'text-neon-purple';
    return 'text-neon-orange';
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Outstanding!';
    if (score >= 80) return 'Excellent!';
    if (score >= 70) return 'Great work!';
    if (score >= 60) return 'Good effort!';
    return 'Keep drilling!';
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-5 pb-8 gap-8"
      style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))' }}
    >
      {/* Score circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="w-36 h-36 rounded-full border-4 border-primary/30 flex items-center justify-center bg-primary/5">
          <div className="text-center">
            <p className={`text-5xl font-grotesk font-bold tabular-nums ${getScoreColor()}`}>{score}</p>
            <p className="text-xs text-muted-foreground">/100</p>
          </div>
        </div>
        <p className="text-xl font-grotesk font-bold text-foreground">{getScoreLabel()}</p>
        <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[category]} · {difficulty}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full grid grid-cols-3 gap-3"
      >
        <StatCard icon={<Target size={16} className="text-neon-purple" />} label="Accuracy" value={`${accuracy}%`} />
        <StatCard icon={<Star size={16} className="text-neon-orange" />} label="Score" value={score} />
        <StatCard icon={<Zap size={16} className="text-neon-cyan" />} label="Mode" value={difficulty[0].toUpperCase() + difficulty.slice(1)} />
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full flex flex-col gap-3"
      >
        <button
          onClick={() => navigate(`/drill?difficulty=${difficulty}&category=${category}`)}
          className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-lg py-5 rounded-2xl glow-purple transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 no-select"
        >
          <RotateCcw size={20} />
          Train Now
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-surface-2 border border-border text-foreground font-semibold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 no-select"
        >
          <Home size={16} />
          Home
        </button>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-surface-2 border border-border rounded-2xl p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">{icon}<span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span></div>
      <p className="text-lg font-grotesk font-bold text-foreground">{value}</p>
    </div>
  );
}