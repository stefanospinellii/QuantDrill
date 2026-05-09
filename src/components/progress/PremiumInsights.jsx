import { motion } from 'framer-motion';
import { Lock, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_LABELS } from '@/lib/badges';

const CATEGORIES = ['mental_math', 'percentages_growth', 'business_math', 'market_sizing', 'gmat_quant'];
const ELITE_BENCHMARKS = {
  mental_math: 88,
  percentages_growth: 85,
  business_math: 82,
  market_sizing: 80,
  gmat_quant: 87,
};

export default function PremiumInsights({ sessions, isPremium, user }) {
  const navigate = useNavigate();

  // Compute stats
  const catStats = CATEGORIES.map(cat => {
    const catSessions = sessions.filter(s => s.category === cat);
    const avgScore = catSessions.length
      ? Math.round(catSessions.reduce((s, r) => s + r.score, 0) / catSessions.length)
      : 0;
    const avgAcc = catSessions.length
      ? Math.round(catSessions.reduce((s, r) => s + (r.accuracy || 0), 0) / catSessions.length)
      : 0;
    const avgTime = catSessions.length
      ? parseFloat((catSessions.reduce((s, r) => s + (r.avg_time || 0), 0) / catSessions.length).toFixed(1))
      : 0;
    return { cat, avgScore, avgAcc, avgTime, count: catSessions.length };
  }).filter(c => c.count > 0);

  const sorted = [...catStats].sort((a, b) => b.avgScore - a.avgScore);
  const weakest = [...catStats].sort((a, b) => a.avgScore - b.avgScore);

  // Speed under pressure (< 8 seconds)
  const fastAnswers = sessions.filter(s => s.avg_time && s.avg_time < 8);
  const fastAccuracy = fastAnswers.length
    ? Math.round(fastAnswers.reduce((s, r) => s + (r.accuracy || 0), 0) / fastAnswers.length)
    : 0;

  // Consistency — std dev of recent 10 scores
  const recent10 = sessions.slice(0, 10);
  const consistency = recent10.length
    ? (() => {
        const mean = recent10.reduce((s, r) => s + r.score, 0) / recent10.length;
        const variance = recent10.reduce((s, r) => s + Math.pow(r.score - mean, 2), 0) / recent10.length;
        const stdDev = Math.sqrt(variance);
        return Math.max(0, 100 - stdDev * 5); // Scale to 0–100, inverted
      })()
    : 0;

  // Improvement: last 7 vs previous 7
  const sorted_by_date = [...sessions].sort((a, b) => a.date > b.date ? -1 : 1);
  const last7 = sorted_by_date.slice(0, 7);
  const prev7 = sorted_by_date.slice(7, 14);

  const lastAvgScore = last7.length ? Math.round(last7.reduce((s, r) => s + r.score, 0) / last7.length) : 0;
  const prevAvgScore = prev7.length ? Math.round(prev7.reduce((s, r) => s + r.score, 0) / prev7.length) : 0;
  const lastAvgAcc = last7.length ? Math.round(last7.reduce((s, r) => s + (r.accuracy || 0), 0) / last7.length) : 0;
  const prevAvgAcc = prev7.length ? Math.round(prev7.reduce((s, r) => s + (r.accuracy || 0), 0) / prev7.length) : 0;

  const scoreDelta = lastAvgScore - prevAvgScore;
  const accDelta = lastAvgAcc - prevAvgAcc;

  // Blurred state for free users
  const blurClass = isPremium ? '' : 'blur-xl brightness-50';
  const showLock = !isPremium;

  // Weakest category for alert
  const weakestCategory = catStats.length > 0
    ? catStats.reduce((a, b) => a.avgAcc < b.avgAcc ? a : b)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.52 }}
      className="relative"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-4">
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">Premium Insights</p>
        {showLock && <Lock size={12} className="text-muted-foreground" />}
      </div>

      {/* Content container */}
      <div className="relative">
        <div className="space-y-3">
           {/* Card 1: Weakest Category Alert */}
           <motion.div
             initial={{ opacity: 0, y: 12 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.54 }}
             className="bg-surface-1 border border-primary/20 rounded-2xl p-5"
           >
             <p className="text-xs font-semibold text-red-400 mb-4 tracking-widest uppercase">Weakest Category Alert</p>
             {catStats.length < 3 ? (
               <p className="text-xs text-muted-foreground">Complete at least 3 sessions to unlock this insight.</p>
             ) : weakestCategory ? (
               <div className="space-y-3">
                 <div>
                   <p className="text-sm font-semibold text-foreground mb-1">{CATEGORY_LABELS[weakestCategory.cat]}</p>
                   <p className="text-2xl font-grotesk font-black text-red-400">{weakestCategory.avgAcc}%</p>
                   <p className="text-[10px] text-muted-foreground mt-1">Average accuracy</p>
                 </div>
                 <button
                   onClick={() => window.location.href = `/drill?category=${weakestCategory.cat}`}
                   className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-xs font-semibold py-2 rounded-lg transition-colors active:scale-95 no-select"
                 >
                   Train This Now →
                 </button>
               </div>
             ) : null}
           </motion.div>

          {/* Card 2: Improvement Momentum */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.56 }}
            className="bg-surface-1 border border-primary/20 rounded-2xl p-5"
          >
            <p className="text-xs font-semibold text-neon-purple mb-4 tracking-widest uppercase">Improvement Momentum</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Speed Trend</span>
                <div className="flex items-center gap-2">
                  {scoreDelta >= 0 ? (
                    <TrendingUp size={12} className="text-emerald-400" />
                  ) : (
                    <TrendingDown size={12} className="text-red-400" />
                  )}
                  <span className={`text-xs font-bold ${scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {scoreDelta >= 0 ? '+' : ''}{scoreDelta}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Accuracy Trend</span>
                <div className="flex items-center gap-2">
                  {accDelta >= 0 ? (
                    <TrendingUp size={12} className="text-emerald-400" />
                  ) : (
                    <TrendingDown size={12} className="text-red-400" />
                  )}
                  <span className={`text-xs font-bold ${accDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {accDelta >= 0 ? '+' : ''}{accDelta}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Speed Under Pressure */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58 }}
            className="bg-surface-1 border border-primary/20 rounded-2xl p-5"
          >
            <p className="text-xs font-semibold text-neon-cyan mb-4 tracking-widest uppercase">Speed Under Pressure</p>
            <div className="text-center">
              <p className="text-3xl font-grotesk font-black text-neon-cyan">{fastAccuracy || '—'}%</p>
              <p className="text-xs text-muted-foreground mt-2">of your answers are fast & accurate</p>
            </div>
          </motion.div>

          {/* Card 4: Consistency Score */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.60 }}
            className="bg-surface-1 border border-primary/20 rounded-2xl p-5"
          >
            <p className="text-xs font-semibold text-neon-orange mb-4 tracking-widest uppercase">Consistency Score</p>
            <div className="text-center">
              <p className="text-3xl font-grotesk font-black text-neon-orange">{Math.round(consistency)}</p>
              <p className="text-xs text-muted-foreground mt-2">Stability across your last 10 sessions</p>
            </div>
          </motion.div>
        </div>

        {/* Gradient blur overlay for free users */}
        {showLock && (
          <>
            {/* Progressive blur mask */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.8) 80%, rgba(0, 0, 0, 0.95) 100%)',
              }}
            />
            {/* Content blur effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backdropFilter: 'blur(8px)',
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 50%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 50%)',
              }}
            />
            {/* Unlock CTA button */}
            <button
              onClick={() => navigate('/paywall')}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl pointer-events-auto no-select active:scale-95 transition-transform z-20"
            >
              Unlock Premium Insights →
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}