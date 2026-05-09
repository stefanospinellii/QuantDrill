import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="flex flex-col items-center gap-6 max-w-xs"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>

        <div>
          <h1 className="text-2xl font-grotesk font-black text-foreground mb-2">
            Payment successful 🎉
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Thank you for your purchase! You can now return to the home page to access your premium features.
          </p>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/')}
          className="bg-primary text-primary-foreground font-grotesk font-bold text-lg px-8 py-4 rounded-2xl glow-purple flex items-center gap-2 active:scale-95 transition-transform no-select"
        >
          <Zap size={20} />
          Go to Home
        </motion.button>
      </motion.div>
    </div>
  );
}