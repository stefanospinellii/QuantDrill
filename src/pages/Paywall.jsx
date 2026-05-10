import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Lock, Check } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const PLANS = [
  { key: 'monthly',  label: 'Pro Monthly',  price: '€9.99',  period: '/ month',   badge: null,          sub: 'Billed monthly' },
  { key: 'yearly',   label: 'Pro Annual',   price: '€59.99', period: '/ year',    badge: 'BEST VALUE',  sub: '€5/month equivalent · Save 50%' },
  { key: 'lifetime', label: 'Lifetime',     price: '€179',   period: 'one-time',  badge: 'LIMITED',     sub: 'Pay once, train forever' },
];

const COMPARISON_ROWS = [
  { label: 'Daily drills',        free: '12/day',       pro: 'Unlimited' },
  { label: 'Categories',          free: '2 categories', pro: 'All 6 categories' },
  { label: 'Difficulty',          free: 'Easy + Medium',pro: 'Easy + Medium + Hard' },
  { label: 'Analytics',           free: 'Basic score',  pro: 'Full performance insights' },
  { label: 'Badges',              free: '22 badges',    pro: '200 badges across 6 performance categories' },
  { label: 'Percentile ranking',  free: false,          pro: true },
  { label: 'Weakness detector',   free: false,          pro: true },
  { label: 'Consistency score',   free: false,          pro: true },
];

export default function Paywall({ onClose }) {
  const navigate = useNavigate();
  const { refetchUser } = useAuth();
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const isPaymentSuccess = urlParams.get('payment') === 'success';

  const [premiumStatus, setPremiumStatus] = useState(null);

  useEffect(() => {
    if (!isPaymentSuccess) return;
    setPremiumStatus('checking');

    let cancelled = false;

    const run = async () => {
      // First check after 3 seconds
      await new Promise(r => setTimeout(r, 3000));
      if (cancelled) return;

      const u1 = await refetchUser();
      if (cancelled) return;

      if (u1?.is_premium) {
        setPremiumStatus('active');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      // Second and final check after 3 more seconds
      await new Promise(r => setTimeout(r, 3000));
      if (cancelled) return;

      const u2 = await refetchUser();
      if (cancelled) return;

      if (u2?.is_premium) {
        setPremiumStatus('active');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setPremiumStatus('slow');
        setTimeout(() => navigate('/home'), 2000);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  const handleCheckout = async (planKey) => {
    setLoading(planKey);
    try {
      const res = await base44.functions.invoke('stripeCheckout', { plan: planKey });
      if (res.data?.url) window.open(res.data.url, '_top');
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
            <motion.div key="active" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-grotesk font-black text-foreground mb-2">You are now Pro!</h1>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">All features unlocked. Redirecting you to training...</p>
              </div>
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : premiumStatus === 'slow' ? (
            <motion.div key="slow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle size={40} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-grotesk font-black text-foreground mb-2">Payment received!</h1>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">Your account is being activated. You'll receive a confirmation email shortly.</p>
              </div>
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : (
            <motion.div key="pending" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-grotesk font-black text-foreground mb-2">Payment received!</h1>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">Activating your account... This takes just a moment.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Normal paywall screen ──
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0B0F14' }}>
      <MobileHeader title="" onBack={handleClose} />

      <div className="flex-1 flex flex-col px-5 pt-4 pb-10 overflow-y-auto w-full max-w-[680px] mx-auto">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          {/* Q logo */}
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ boxShadow: '0 0 32px rgba(139,92,246,0.4)' }}>
            <span className="text-2xl font-grotesk font-black text-white">Q</span>
          </div>
          <h1 className="text-3xl font-grotesk font-black text-foreground leading-tight mb-3">
            Unlock Pro Training
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Built for candidates who take MBB, IB, GMAT and GRE seriously.
          </p>
        </motion.div>

        {/* Free vs Pro comparison table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-7">
          {/* Table header */}
          <div className="grid grid-cols-3 gap-2 mb-2 px-1">
            <div />
            <div className="text-center text-xs font-semibold text-muted-foreground py-2 bg-surface-2 rounded-xl border border-border">Free</div>
            <div className="text-center text-xs font-bold text-primary py-2 bg-primary/10 rounded-xl border border-primary/30">Pro ⭐</div>
          </div>
          {/* Rows */}
          <div className="rounded-2xl border border-border overflow-hidden">
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 gap-2 px-3 py-3 items-center ${i < COMPARISON_ROWS.length - 1 ? 'border-b border-border' : ''}`}
              >
                <span className="text-xs text-muted-foreground leading-snug">{row.label}</span>
                <div className="text-center">
                  {row.free === false ? (
                    <span className="text-muted-foreground text-sm">✕</span>
                  ) : (
                    <span className="text-xs text-muted-foreground leading-snug">{row.free}</span>
                  )}
                </div>
                <div className="text-center">
                  {row.pro === true ? (
                    <span className="text-neon-cyan text-sm font-bold">✓</span>
                  ) : (
                    <span className="text-xs text-foreground font-semibold leading-snug">{row.pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Plan selector */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="space-y-3 mb-6">
          {PLANS.map(plan => (
            <div
              key={plan.key}
              onClick={() => setSelected(plan.key)}
              className={`rounded-2xl border transition-all cursor-pointer ${
                selected === plan.key ? 'bg-primary/10 border-primary' : 'bg-surface-2 border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    selected === plan.key ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {selected === plan.key && (
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{plan.label}</span>
                      {plan.badge && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          plan.badge === 'BEST VALUE'
                            ? 'text-neon-cyan bg-cyan-500/10 border border-cyan-500/25'
                            : 'text-neon-orange bg-orange-500/10 border border-orange-500/20'
                        }`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{plan.sub}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-grotesk font-black text-foreground">{plan.price}</span>
                  <p className="text-[10px] text-muted-foreground">{plan.period}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Single CTA button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          onClick={() => handleCheckout(selected)}
          disabled={!!loading}
          className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-base py-4 rounded-2xl glow-purple active:scale-95 transition-all no-select disabled:opacity-60 flex items-center justify-center gap-2 mb-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Upgrade to Pro →'
          )}
        </motion.button>

        <p className="text-center text-xs text-muted-foreground">
          No ads · Secure payment via Stripe · GDPR compliant
        </p>
      </div>
    </div>
  );
}