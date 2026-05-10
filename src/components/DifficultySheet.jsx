import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check, Zap, Clock } from 'lucide-react';
import { getUserAccess } from '@/lib/accessControl';

// Per-question soft time expectations (Normal mode only, visual hint only)
export const QUESTION_TIME_EXPECTATIONS = { easy: 25, medium: 45, hard: 75 };

const DIFFICULTIES = [
  { key: 'easy',   label: 'Easy',   desc: 'Simpler calculations · building foundations' },
  { key: 'medium', label: 'Medium', desc: 'Standard consulting / GMAT pace' },
  { key: 'hard',   label: 'Hard',   desc: 'Advanced reasoning · complex mental math' },
];

const DURATIONS = [
  { minutes: 2,  label: '2 min' },
  { minutes: 5,  label: '5 min' },
  { minutes: 10, label: '10 min' },
];

const PREMIUM_CATEGORIES = ['gmat_quant', 'market_sizing'];

export default function DifficultySheet({ open, value, onClose, category, onStart, onNeedsAuth, user }) {
  const [difficulty, setDifficulty] = useState(value || 'medium');
  const [pace, setPace] = useState('normal'); // 'normal' | 'fast'
  const [duration, setDuration] = useState(5);

  const isPremiumCat = PREMIUM_CATEGORIES.includes(category);

  // A difficulty is soft-locked only if: premium category + hard + free user
  // (standard hard lock still applies from getUserAccess for non-premium users in all cats)
  const isDiffAccessible = (diffKey) => getUserAccess(user, category, diffKey);

  // Soft warning: premium category + hard selected + free user
  const showHardPremiumHint = difficulty === 'hard' && isPremiumCat && !user?.is_premium;

  const canStart = user
    ? isDiffAccessible(difficulty)
    : true; // auth check handled by onNeedsAuth

  const handleStart = () => {
    if (!canStart) return;
    if (onNeedsAuth) {
      onNeedsAuth({ difficulty, duration: pace === 'fast' ? duration : null, category, pace });
      return;
    }
    onClose();
    onStart({ difficulty, duration: pace === 'fast' ? duration : null, category, pace });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center no-select"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] mx-5"
          >
            <div
              className="relative rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
              style={{
                background: 'hsl(220 18% 9%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-3xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-grotesk font-bold text-foreground">Configure Session</h2>
                <button onClick={onClose} className="w-8 h-8 bg-surface-2 rounded-xl flex items-center justify-center no-select">
                  <X size={15} className="text-muted-foreground" />
                </button>
              </div>

              {/* ── PACE MODE ── */}
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.13em' }}>Pace Mode</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {/* Normal */}
                <button
                  onClick={() => setPace('normal')}
                  className="relative flex flex-col items-start gap-1 px-4 py-3.5 rounded-2xl border text-left no-select transition-all"
                  style={{
                    background: pace === 'normal' ? 'rgba(124,58,237,0.1)' : 'hsl(220 16% 12%)',
                    border: pace === 'normal' ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Clock size={13} className="text-muted-foreground" />
                      Normal
                    </span>
                    {pace === 'normal' && <Check size={13} className="text-primary shrink-0" />}
                  </div>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Untimed · practice focus</p>
                </button>

                {/* Fast-Paced */}
                <button
                  onClick={() => setPace('fast')}
                  className="relative flex flex-col items-start gap-1 px-4 py-3.5 rounded-2xl border text-left no-select transition-all"
                  style={{
                    background: pace === 'fast' ? 'rgba(124,58,237,0.1)' : 'hsl(220 16% 12%)',
                    border: pace === 'fast' ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Zap size={13} className="text-neon-cyan" />
                      Fast-Paced
                    </span>
                    {pace === 'fast' && <Check size={13} className="text-primary shrink-0" />}
                  </div>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Timed · interview pace</p>
                </button>
              </div>

              {/* ── DURATION (only in Fast-Paced) ── */}
              <AnimatePresence>
                {pace === 'fast' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.13em' }}>Duration</p>
                    <div className="flex gap-2 mb-6">
                      {DURATIONS.map(d => (
                        <button
                          key={d.minutes}
                          onClick={() => setDuration(d.minutes)}
                          className="flex-1 py-3 rounded-2xl border font-grotesk font-bold text-sm no-select transition-all"
                          style={{
                            background: duration === d.minutes ? 'rgba(124,58,237,0.1)' : 'hsl(220 16% 12%)',
                            border: duration === d.minutes ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.07)',
                            color: duration === d.minutes ? 'hsl(262 83% 68%)' : 'rgba(255,255,255,0.6)',
                          }}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── DIFFICULTY ── */}
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.13em' }}>Difficulty</p>
              <div className="space-y-2 mb-5">
                {DIFFICULTIES.map(opt => {
                  const accessible = isDiffAccessible(opt.key);
                  return (
                    <button
                      key={opt.key}
                      onClick={() => accessible && setDifficulty(opt.key)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left no-select transition-all"
                      style={{
                        background: !accessible
                          ? 'rgba(255,255,255,0.01)'
                          : difficulty === opt.key
                          ? 'rgba(124,58,237,0.1)'
                          : 'hsl(220 16% 12%)',
                        border: !accessible
                          ? '1px solid rgba(255,255,255,0.04)'
                          : difficulty === opt.key
                          ? '1px solid rgba(124,58,237,0.4)'
                          : '1px solid rgba(255,255,255,0.07)',
                        opacity: !accessible ? 0.45 : 1,
                        cursor: accessible ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          {opt.label}
                          {!accessible && <Lock size={10} className="text-neon-orange" />}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>{opt.desc}</p>
                      </div>
                      {accessible && difficulty === opt.key && <Check size={15} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Soft hint for premium category + hard */}
              <AnimatePresence>
                {showHardPremiumHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-5 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,153,51,0.08)', border: '1px solid rgba(255,153,51,0.2)' }}
                  >
                    <p className="text-xs" style={{ color: 'rgba(255,153,51,0.9)' }}>
                      <span className="font-bold">Hard difficulty</span> in this category is available for Pro users.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Per-question time hint (Normal mode only) */}
              {pace === 'normal' && (
                <p className="text-[10px] mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  ⏱ Soft time target: <span style={{ color: 'rgba(255,255,255,0.4)' }}>{QUESTION_TIME_EXPECTATIONS[difficulty]}s per question</span> · no hard timeout
                </p>
              )}

              {/* CTA */}
              <motion.button
                onClick={handleStart}
                disabled={!canStart}
                animate={{ opacity: canStart ? 1 : 0.35 }}
                transition={{ duration: 0.18 }}
                className="w-full font-grotesk font-bold text-white text-base py-4 rounded-2xl no-select flex items-center justify-center gap-2"
                style={{
                  background: canStart ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : 'rgba(124,58,237,0.3)',
                  boxShadow: canStart ? '0 0 30px rgba(124,58,237,0.35)' : 'none',
                  cursor: canStart ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => canStart && (e.currentTarget.style.boxShadow = '0 0 45px rgba(124,58,237,0.55)')}
                onMouseLeave={e => canStart && (e.currentTarget.style.boxShadow = '0 0 30px rgba(124,58,237,0.35)')}
              >
                {pace === 'fast' ? <Zap size={18} /> : <Check size={18} />}
                {pace === 'fast' ? `Start ${duration}-Minute Session` : 'Start Session'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}