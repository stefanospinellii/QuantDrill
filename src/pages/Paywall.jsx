import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, Crown } from 'lucide-react';

const FREE_FEATURES = [
  '35 drills per day',
  'Daily drill (mixed)',
  'Streak tracking',
  'Basic stats',
];

const PREMIUM_FEATURES = [
  'Unlimited drills',
  'All 5 training categories',
  'Hard mode',
  'Advanced analytics',
  'Full badge system',
  'Detailed performance insights',
  'Category-level progress',
];

const PLANS = [
  { id: 'monthly',  label: 'Monthly',  price: '$9.99',  sub: 'per month',      badge: null },
  { id: 'yearly',   label: 'Yearly',   price: '$59.99', sub: 'per year · save 50%', badge: 'Best Value' },
  { id: 'lifetime', label: 'Lifetime', price: '$99',    sub: 'one-time',        badge: 'Most Popular' },
];

export default function Paywall({ onClose }) {
  const navigate = useNavigate();
  const handleClose = onClose ?? (() => navigate(-1));

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-md mx-auto px-5 pb-12" style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))' }}>
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 bg-surface-2 rounded-xl flex items-center justify-center no-select border border-border"
          style={{ top: 'max(16px, env(safe-area-inset-top, 16px))' }}
        >
          <X size={15} className="text-muted-foreground" />
        </button>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 pt-6">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Crown size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-grotesk font-black text-foreground mb-2">
            Unlock Elite Quant Training
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Train without limits. Built for GMAT, consulting, and finance candidates.
          </p>
        </motion.div>

        {/* Feature comparison */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {/* Free */}
            <div className="bg-surface-2 border border-border rounded-2xl p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Free</p>
              <div className="space-y-2">
                {FREE_FEATURES.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <Check size={13} className="text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Premium */}
            <div className="bg-primary/5 border border-primary/30 rounded-2xl p-4">
              <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Premium ✦</p>
              <div className="space-y-2">
                {PREMIUM_FEATURES.map(f => (
                  <div key={f} className="flex items-start gap-2">
                    <Check size={13} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-xs text-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Plans */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3 mb-6">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              className="w-full flex items-center justify-between bg-surface-2 border border-border rounded-2xl px-4 py-4 hover:border-primary/50 transition-colors active:scale-95 no-select relative overflow-hidden"
            >
              {plan.badge && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-bl-xl">
                  {plan.badge}
                </span>
              )}
              <div className="text-left">
                <p className="text-sm font-grotesk font-bold text-foreground">{plan.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{plan.sub}</p>
              </div>
              <p className="text-xl font-grotesk font-black text-primary">{plan.price}</p>
            </button>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <button className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-base py-5 rounded-2xl glow-purple transition-all active:scale-95 flex items-center justify-center gap-2 no-select mb-3">
            <Zap size={18} /> Train Without Limits
          </button>
          <button onClick={handleClose} className="w-full text-xs text-muted-foreground py-2 no-select">
            Continue with free plan
          </button>
          <p className="text-center text-[10px] text-muted-foreground mt-3">
            Cancel anytime · No ads · Secure payment
          </p>
        </motion.div>
      </div>
    </div>
  );
}