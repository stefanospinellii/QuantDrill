import { useEffect, useRef, useState } from 'react';

/**
 * Global session timer bar — shows time remaining as a thin progress bar
 * and a compact HH:MM display.
 */
export default function GlobalTimer({ totalSeconds, onExpire, isActive }) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!isActive) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const progress = timeLeft / totalSeconds;
  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, '0');

  const barColor =
    progress > 0.4 ? 'bg-neon-cyan' :
    progress > 0.2 ? 'bg-neon-orange' : 'bg-red-500';

  return (
    <div className="px-5 mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Time Remaining</p>
        <span className={`text-sm font-grotesk font-bold tabular-nums ${
          progress > 0.4 ? 'text-neon-cyan' : progress > 0.2 ? 'text-neon-orange' : 'text-red-400'
        }`}>
          {mins}:{secs}
        </span>
      </div>
      <div className="w-full h-1 bg-surface-3 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}