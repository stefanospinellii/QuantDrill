import { motion } from 'framer-motion';
import { getSpeedPercentile } from '@/lib/questionGenerator';

function Ring({ radius, stroke, progress, color }) {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));
  const size = (radius + stroke) * 2;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(220 15% 16%)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke 0.15s ease, stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
}

function getAccuracyColor(accuracy) {
  if (accuracy >= 95) return '#22c55e';
  if (accuracy >= 90) return '#86efac';
  if (accuracy >= 80) return '#eab308';
  return '#ef4444';
}

function RingCard({ label, value, sub, progress, ringColor, delay = 0, noData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="flex-1 bg-surface-2 border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-2"
    >
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
      <div className="relative flex items-center justify-center my-1">
        <Ring radius={38} stroke={5} progress={noData ? 0 : progress} color={noData ? 'hsl(220 15% 22%)' : ringColor} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-grotesk font-black tabular-nums text-foreground leading-none">
            {noData ? '—' : value}
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug min-h-[2.5em] flex items-center justify-center">
        {noData ? 'No data yet' : (sub || '')}
      </p>
    </motion.div>
  );
}

export default function BenchmarkMetrics({ sessions }) {
  const last5 = sessions.slice(0, 5);
  const hasData = last5.length > 0;

  // Accuracy
  const avgAccuracy = hasData
    ? Math.round(last5.reduce((s, r) => s + (r.accuracy ?? 0), 0) / last5.length)
    : 0;
  const accuracyColor = getAccuracyColor(avgAccuracy);
  const accuracyProgress = Math.min(1, avgAccuracy / 95);

  // Speed
  const avgSpeed = hasData
    ? parseFloat((last5.reduce((s, r) => s + (r.avg_time ?? 14), 0) / last5.length).toFixed(1))
    : 0;
  const speedPct = hasData ? getSpeedPercentile(avgSpeed, 'medium') : 0;
  const speedProgress = Math.min(1, speedPct / 100);

  // Volume
  const totalSessions = sessions.length;

  return (
    <div className="flex flex-col gap-3">
      {/* Primary Row: two large rings */}
      <div className="flex gap-3">
        <RingCard
          label="5-Session Accuracy"
          value={`${avgAccuracy}%`}
          sub={null}
          progress={accuracyProgress}
          ringColor={accuracyColor}
          delay={0.05}
          noData={!hasData}
        />
        <RingCard
          label="5-Session Speed"
          value={`${avgSpeed}s`}
          sub={hasData ? <>Top <span className="font-bold text-neon-purple">{speedPct}%</span> of candidates</> : null}
          progress={speedProgress}
          ringColor="hsl(262 83% 68%)"
          delay={0.1}
          noData={!hasData}
        />
      </div>

      {/* Secondary Row: compact volume bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.3 }}
        className="flex items-center justify-center gap-2 bg-surface-2 border border-border rounded-xl px-4 py-2.5"
      >
        <span className="text-sm font-grotesk font-bold text-foreground tabular-nums">{totalSessions}</span>
        <span className="text-xs text-muted-foreground">sessions completed</span>
      </motion.div>
    </div>
  );
}