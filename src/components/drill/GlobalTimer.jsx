import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function GlobalTimer({ totalSeconds, onExpire, isActive }) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => { setTimeLeft(totalSeconds); }, [totalSeconds]);

  useEffect(() => {
    if (!isActive) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const progress = timeLeft / totalSeconds;
  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, '0');

  const urgent = progress < 0.2;
  const warning = progress < 0.4;

  const barColor = urgent
    ? '#ef4444'
    : warning
    ? 'hsl(28 100% 58%)'
    : 'hsl(174 100% 45%)';

  const timeColor = urgent
    ? '#ef4444'
    : warning
    ? 'hsl(28 100% 58%)'
    : 'hsl(174 100% 45%)';

  return (
    <div className="px-5 mb-5">
      <div
        className="rounded-2xl px-4 py-3 relative overflow-hidden"
        style={{
          background: 'hsl(220 18% 9%)',
          border: `1px solid ${urgent ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}`,
          transition: 'border-color 0.5s ease',
        }}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${barColor}40, transparent)` }} />

        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.13em' }}>
            Session Time
          </p>
          <motion.span
            animate={urgent ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.8, repeat: urgent ? Infinity : 0 }}
            className="font-grotesk font-black tabular-nums text-base"
            style={{ color: timeColor, transition: 'color 0.5s ease' }}
          >
            {mins}:{secs}
          </motion.span>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${barColor}99, ${barColor})`,
              transition: 'width 1s linear, background 0.5s ease',
              boxShadow: `0 0 8px ${barColor}60`,
            }}
          />
        </div>
      </div>
    </div>
  );
}