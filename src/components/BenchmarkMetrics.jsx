import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getSpeedPercentile } from '@/lib/questionGenerator';
import { computeBadgeContext } from '@/lib/badges';

function AnimatedRing({ radius, stroke, progress, color, started }) {
  const circumference = 2 * Math.PI * radius;
  const size = (radius + stroke) * 2;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={started ? circumference * (1 - Math.min(1, Math.max(0, progress))) : circumference}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  );
}

function getAccuracyColor(accuracy) {
  if (accuracy >= 90) return '#34D399';
  if (accuracy >= 80) return '#a78bfa';
  if (accuracy >= 70) return '#FF9933';
  return '#ef4444';
}

function getNextBadgeMilestone(sessions) {
  const totalDrills = sessions.length;
  const milestones = [
    { drills: 1,    label: 'First Rep' },
    { drills: 10,   label: 'Warming Up' },
    { drills: 25,   label: 'Consistent' },
    { drills: 100,  label: 'Centurion' },
    { drills: 500,  label: 'Elite' },
  ];
  for (const m of milestones) {
    if (totalDrills < m.drills) {
      const rem = m.drills - totalDrills;
      return `${rem} to ${m.label}`;
    }
  }
  return 'All milestones unlocked';
}

function MetricCard({ label, value, sub, progress, ringColor, delay = 0, noData, onClick }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center text-center gap-2 w-full no-select overflow-hidden"
      style={{
        background: 'hsl(220 18% 9%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 18,
        padding: '14px 8px 12px',
        transition: 'all 0.22s ease',
      }}
      whileHover={{ y: -2, borderColor: 'rgba(124,58,237,0.3)', transition: { duration: 0.18 } }}
    >
      {/* Top edge glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100" style={{ background: `linear-gradient(90deg, transparent, ${ringColor}40, transparent)` }} />

      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none w-full text-center" style={{ letterSpacing: '0.12em' }}>
        {label}
      </p>

      <div className="relative flex items-center justify-center">
        <AnimatedRing
          radius={30} stroke={3.5}
          progress={noData ? 0 : progress}
          color={noData ? 'rgba(255,255,255,0.08)' : ringColor}
          started={isInView}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-grotesk font-black tabular-nums leading-none"
            style={{
              fontSize: value && value.length > 4 ? '10px' : '13px',
              color: noData ? 'rgba(255,255,255,0.2)' : '#fff',
              textShadow: '0 0 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)',
            }}
          >
            {noData ? '—' : value}
          </span>
        </div>
      </div>

      <p className="text-[9px] leading-snug min-h-[24px] flex items-center justify-center px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {noData ? 'Complete a session' : (sub || '')}
      </p>
    </motion.button>
  );
}

export default function BenchmarkMetrics({ sessions }) {
  const navigate = useNavigate();
  const last5 = sessions.slice(0, 5);
  const hasData = last5.length > 0;

  const avgAccuracy = hasData
    ? Math.round(last5.reduce((s, r) => s + (r.accuracy ?? 0), 0) / last5.length)
    : 0;
  const accuracyColor = getAccuracyColor(avgAccuracy);

  const avgSpeed = hasData
    ? parseFloat((last5.reduce((s, r) => s + (r.avg_time ?? 14), 0) / last5.length).toFixed(1))
    : 0;
  const rawSpeedPct = hasData ? getSpeedPercentile(avgSpeed, 'medium') : 0;
  // Convert raw percentile (% of users slower than you) → "Top X%" rank (lower = better)
  const speedTopPct = hasData ? Math.max(1, 100 - rawSpeedPct) : 0;

  const totalSessions = sessions.length;
  const nextBadge = getNextBadgeMilestone(sessions);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <MetricCard
        label="Accuracy"
        value={`${avgAccuracy}%`}
        sub="last 5 sessions"
        progress={avgAccuracy / 95}
        ringColor={accuracyColor}
        delay={0.05}
        noData={!hasData}
        onClick={() => navigate('/progress?section=accuracy')}
      />
      <MetricCard
        label="Speed Rank"
        value={speedTopPct > 0 ? `Top ${speedTopPct}%` : '—'}
        sub="vs all candidates"
        progress={hasData ? Math.min(1, (100 - speedTopPct) / 100) : 0}
        ringColor="hsl(262 83% 68%)"
        delay={0.1}
        noData={!hasData}
        onClick={() => navigate('/progress?section=speed')}
      />
      <MetricCard
        label="Sessions"
        value={totalSessions}
        sub={nextBadge}
        progress={Math.min(1, totalSessions / 50)}
        ringColor="hsl(28 100% 58%)"
        delay={0.15}
        noData={totalSessions === 0}
        onClick={() => navigate('/progress?section=sessions')}
      />
    </div>
  );
}