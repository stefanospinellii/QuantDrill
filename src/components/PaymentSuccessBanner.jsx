import { motion } from 'framer-motion';
import { X, Zap } from 'lucide-react';

export default function PaymentSuccessBanner({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-0 inset-x-0 z-50 px-4"
      style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}
    >
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3 flex items-start gap-3 backdrop-blur-sm shadow-lg">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Zap size={16} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-grotesk font-bold text-emerald-400">You're now Pro!</p>
          <p className="text-xs text-muted-foreground mt-0.5">All features are unlocked. Welcome to the Pro tier.</p>
        </div>
        <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors no-select">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}