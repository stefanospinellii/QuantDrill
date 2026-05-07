import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check } from 'lucide-react';

const options = [
  { key: 'easy', label: 'Easy', desc: '15 second timer · Warm-up pace' },
  { key: 'medium', label: 'Medium', desc: '12 second timer · Default mode' },
  { key: 'hard', label: 'Hard', desc: '8 second timer · Elite speed drills', premium: true },
];

export default function DifficultySheet({ open, value, onChange, onClose }) {
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
            className="fixed inset-0 bg-black/60 z-40 no-select"
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-md bg-surface-1 border-t border-border rounded-t-3xl z-50 pb-safe"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-surface-3 rounded-full" />
            </div>
            <div className="px-5 pt-3 pb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-grotesk font-bold text-foreground">Select Difficulty</h2>
                <button onClick={onClose} className="w-8 h-8 bg-surface-2 rounded-xl flex items-center justify-center no-select">
                  <X size={15} className="text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-2">
                {options.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { if (!opt.premium) { onChange(opt.key); onClose(); } }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border text-left no-select transition-all ${
                      value === opt.key && !opt.premium
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface-2 border-border'
                    } ${opt.premium ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${opt.premium ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {opt.label}
                        {opt.premium && <Lock size={11} className="inline ml-1.5 text-neon-orange" />}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                    {value === opt.key && !opt.premium && (
                      <Check size={16} className="text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}