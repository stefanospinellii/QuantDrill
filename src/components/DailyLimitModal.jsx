import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ArrowUpRight } from 'lucide-react';

function getMsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
}

function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function DailyLimitModal({ open, onClose }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(() => formatCountdown(getMsUntilMidnight()));

  useEffect(() => {
    if (!open) return;
    const tick = setInterval(() => {
      setCountdown(formatCountdown(getMsUntilMidnight()));
    }, 1000);
    return () => clearInterval(tick);
  }, [open]);

  const handleUpgrade = () => {
    onClose();
    navigate('/paywall');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[9999]"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-x-5 z-[9999] mx-auto max-w-sm lg:max-w-md"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="bg-surface-1 border border-border rounded-3xl p-6 text-center">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-7 h-7 bg-surface-3 rounded-full flex items-center justify-center no-select"
              >
                <X size={13} className="text-muted-foreground" />
              </button>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <Flame size={24} className="text-neon-orange" />
              </div>

              <h2 className="text-lg font-grotesk font-black text-foreground mb-2">
                Daily Training Complete
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                You've completed your daily training.<br />
                Upgrade to Pro for unlimited drills,<br />
                or come back tomorrow.
              </p>

              {/* Countdown */}
              <div className="bg-surface-2 border border-border rounded-2xl px-4 py-3 mb-6">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">
                  Resets in
                </p>
                <p className="text-2xl font-grotesk font-bold text-foreground tabular-nums tracking-tight">
                  {countdown}
                </p>
              </div>

              {/* Buttons */}
              <button
                onClick={handleUpgrade}
                className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-base py-4 rounded-2xl glow-purple flex items-center justify-center gap-2 no-select active:scale-95 transition-transform mb-3"
              >
                Upgrade to Pro
                <ArrowUpRight size={18} />
              </button>
              <button
                onClick={onClose}
                className="w-full text-sm text-muted-foreground py-2 no-select"
              >
                Come back tomorrow
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}