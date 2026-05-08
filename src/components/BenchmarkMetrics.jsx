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
  if (accuracy >= 95) return '#22c55e';       // solid green
  if (accuracy >= 90) return '#86efac';       // light green
  if (accuracy >= 80) return '#eab308';       // yellow
  return '#ef4444';                           // red
}

function MetricCard({ label, value, sub, progress, ringColor, delay = 0, noData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="bg-surface-2 border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-2"
    >
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
      <div className="relative flex items-center justify-center my-1">
        <Ring radius={30} stroke={4} progress={noData ? 0 : progress} color={noData ? 'hsl(220 15% 22%)' : ringColor} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-grotesk font-black tabular-nums text-foreground leading-none">
            {noData ? '—' : value}
          </span>
        </div>
      </div>
      {sub && (
        <p className="text-[11px] text-muted-foreground leading-snug">
          {noData ? 'No data yet' : sub}
        </p>
      )}
      {!sub && noData && (
        <p className="text-[11px] text-muted-foreground leading-snug">No data yet</p>
      )}
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
  const accuracyProgress = avgAccuracy / 95; // progress toward 95% target

  // Speed
  const avgSpeed = hasData
    ? parseFloat((last5.reduce((s, r) => s + (r.avg_time ?? 14), 0) / last5.length).toFixed(1))
    : 0;
  const speedPct = hasData ? getSpeedPercentile(avgSpeed, 'medium') : 0;
  const speedProgress = Math.min(1, speedPct / 100);

  // Volume
  const totalSessions = sessions.length;
  const volumeProgress = Math.min(1, totalSessions / 50);

  return (
    <div className="grid grid-cols-3 gap-3">
      <MetricCard
        label="5-Session Accuracy"
        value={`${avgAccuracy}%`}
        sub={null}
        progress={accuracyProgress}
        ringColor={accuracyColor}
        delay={0.05}
        noData={!hasData}
      />
      <MetricCard
        label="5-Session Speed"
        value={`${avgSpeed}s`}
        sub={<>Among the <span className="font-bold text-neon-purple">{speedPct}%</span> fastest candidates</>}
        progress={speedProgress}
        ringColor="hsl(262 83% 68%)"
        delay={0.1}
        noData={!hasData}
      />
      <MetricCard
        label="Total Volume"
        value={totalSessions}
        sub={null}
        progress={volumeProgress}
        ringColor="hsl(28 100% 58%)"
        delay={0.15}
        noData={totalSessions === 0}
      />
    </div>
  );
}