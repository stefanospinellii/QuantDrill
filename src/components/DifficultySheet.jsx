import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DIFFICULTIES = [
  { key: 'easy',   label: 'Easy',   desc: 'Beginner-friendly · simpler calculations' },
  { key: 'medium', label: 'Medium', desc: 'Standard consulting / GMAT level' },
  { key: 'hard',   label: 'Hard',   desc: 'Advanced mental math · complex reasoning' },
];

const DURATIONS = [
  { minutes: 2,  label: '2 min' },
  { minutes: 5,  label: '5 min' },
  { minutes: 10, label: '10 min' },
];

export default function DifficultySheet({ open, value, onClose, category, onStart, onNeedsAuth, isPremium }) {
  const [difficulty, setDifficulty] = useState(value || 'medium');
  const [duration, setDuration] = useState(null);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!duration) return;
    if (onNeedsAuth) {
      // caller will handle auth then call onStart
      onNeedsAuth({ difficulty, duration, category });
      return;
    }
    onClose();
    onStart({ difficulty, duration, category });
  };

  const handleDifficultySelect = (key) => {
    setDifficulty(key);
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
            className="fixed inset-0 bg-black/60 z-[9999] no-select"
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
            <div className="bg-surface-1 border border-border rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
              <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-grotesk font-bold text-foreground">Start Session</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-surface-2 rounded-xl flex items-center justify-center no-select"
                >
                  <X size={15} className="text-muted-foreground" />
                </button>
              </div>

              {/* Difficulty */}
              <div className="space-y-2 mb-6">
                {DIFFICULTIES.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      if (opt.key === 'hard' && !isPremium) {
                        onClose();
                        navigate('/paywall');
                      } else {
                        handleDifficultySelect(opt.key);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left no-select transition-all active:scale-[0.98] ${
                      difficulty === opt.key
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface-2 border-border'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {opt.label}
                        {opt.key === 'hard' && !isPremium && <Lock size={11} className="text-neon-orange" />}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                    {difficulty === opt.key && (
                      <Check size={16} className="text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Session Length */}
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2.5">Session Length</p>
              <div className="flex gap-2 mb-5">
                {DURATIONS.map(d => (
                  <button
                    key={d.minutes}
                    onClick={() => setDuration(d.minutes)}
                    className={`flex-1 py-3.5 rounded-2xl border font-grotesk font-bold text-base no-select transition-all active:scale-[0.95] ${
                      duration === d.minutes
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface-2 border-border text-foreground hover:border-primary/40'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Start CTA */}
              <motion.button
                onClick={handleStart}
                disabled={!duration}
                animate={{ opacity: duration ? 1 : 0.4, scale: duration ? 1 : 0.98 }}
                transition={{ duration: 0.18 }}
                className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-lg py-4 rounded-2xl glow-purple flex items-center justify-center gap-2 no-select active:scale-95 transition-transform disabled:cursor-default"
              >
                <Zap size={20} />
                Start Session
              </motion.button>

            </div>
            </div>
            </motion.div>
            </>
            )}
            </AnimatePresence>
            );
            }