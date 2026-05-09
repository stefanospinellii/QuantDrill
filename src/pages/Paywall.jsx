import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, BarChart2, Award, Infinity as InfinityIcon, Lock, CheckCircle } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import { base44 } from '@/api/base44Client';

const PLANS = [
  { key: 'monthly',  label: 'Pro Monthly',  badge: null,           sub: 'Billed monthly' },
  { key: 'yearly',   label: 'Pro Annual',   badge: 'Best Value',   sub: 'Save 50% vs monthly' },
  { key: 'lifetime', label: 'Lifetime',     badge: '🔥 Limited',   sub: 'Pay once, train forever' },
];

const PREMIUM_FEATURES = [
  { icon: <InfinityIcon size={15} className="text-neon-cyan" />,    label: 'Train Without Limits',          sub: 'Unlimited daily drills across all categories' },
  { icon: <Zap size={15} className="text-neon-purple" />,           label: 'All Categories + Hard Mode',    sub: 'Mental Math, Business Math, GMAT Quant & more' },
  { icon: <BarChart2 size={15} className="text-neon-orange" />,     label: 'Advanced Performance Analytics', sub: 'Speed trends, improvement tracking, percentiles' },
  { icon: <Award size={15} className="text-yellow-400" />,          label: 'Full Achievement System',       sub: '22 badges across 6 performance categories' },
  { icon: <Lock size={15} className="text-emerald-400" />,          label: 'Detailed Performance Insights', sub: 'Category breakdowns and benchmarking data' },
];

export default function Paywall({ onClose }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);

  // Payment success state
  const urlParams = new URLSearchParams(window.location.search);
  const paymentParam = urlParams.get('payment');
  const isPaymentSuccess = paymentParam === 'success';

  const [premiumStatus, setPremiumStatus] = useState(null); // null | 'checking' | 'active' | 'pending'
  const pollRef = useRef(null);

  // On mount, if payment=success, start checking premium status
  useEffect(() => {
    if (!isPaymentSuccess) return;
    setPremiumStatus('checking');
    checkPremium();
    return () => clearInterval(pollRef.current);
  }, []);

  const checkPremium = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.is_premium) {
        setPremiumStatus('active');
        clearInterval(pollRef.current);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setPremiumStatus('pending');
        // Poll every 3 seconds
        pollRef.current = setInterval(async () => {
          try {
            const u = await base44.auth.me();
            if (u?.is_premium) {
              setPremiumStatus('active');
              clearInterval(pollRef.current);
              setTimeout(() => navigate('/'), 2000);
            }
          } catch (_) {}
        }, 3000);
      }
    } catch (_) {
      setPremiumStatus('pending');
    }
  };

  const handleClose = () => {
    clearInterval(pollRef.current);
    if (onClose) onClose();
    else navigate(-1);
  };

  const handleCheckout = async (planKey) => {
    setLoading(planKey);
    try {
      const res = await base44.functions.invoke('stripeCheckout', { plan: planKey });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Payment success screen ──
  if (isPaymentSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          {premiumStatus === 'active' ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-grotesk font-black text-foreground mb-2">You are now Pro!</h1>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  All features unlocked. Redirecting you to training...
                </p>
              </div>
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-grotesk font-black text-foreground mb-2">Payment received!</h1>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  Activating your account... This takes just a moment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Normal paywall screen ──
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader title="" onBack={handleClose} />

      <div className="flex-1 flex flex-col px-5 pt-4 pb-8 overflow-y-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-3xl">
            🏋️
          </div>
          <h1 className="text-2xl font-grotesk font-black text-foreground leading-tight mb-2">
            Unlock Elite<br />
            <span className="text-neon-purple">Quant Training</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Built for GMAT, consulting, and finance candidates who take performance seriously.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-2 border border-border rounded-2xl px-4 py-4 mb-6 space-y-3.5"
        >
          {PREMIUM_FEATURES.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center shrink-0 mt-0.5">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Plans — each with its own CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="space-y-3 mb-6"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Choose Your Plan</p>
          {PLANS.map(plan => (
            <div
              key={plan.key}
              onClick={() => setSelected(plan.key)}
              className={`rounded-2xl border transition-all cursor-pointer ${
                selected === plan.key ? 'bg-primary/10 border-primary' : 'bg-surface-2 border-border'
              }`}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    selected === plan.key ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {selected === plan.key && (
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{plan.label}</span>
                      {plan.badge && (
                        <span className="text-[9px] font-bold text-neon-orange bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{plan.sub}</p>
                  </div>
                </div>
              </div>

              {selected === plan.key && (
                <div className="px-4 pb-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCheckout(plan.key); }}
                    disabled={!!loading}
                    className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-sm py-3 rounded-xl glow-purple active:scale-95 transition-all no-select disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading === plan.key ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Upgrade to Pro →</>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-auto">
          Cancel anytime · No ads · Secure payment via Stripe
        </p>
      </div>
    </div>
  );
}