import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, BarChart2, Award, Infinity as InfinityIcon, Lock, RefreshCw } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';
import { base44 } from '@/api/base44Client';

const PLANS = [
  {
    key: 'monthly',
    label: 'Pro Monthly',
    price: '€9.99',
    period: '/mo',
    badge: null,
    perDay: '€0.33/day',
    url: 'https://quantdrill.com/subscribe?plan=monthly',
  },
  {
    key: 'yearly',
    label: 'Pro Annual',
    price: '€59.99',
    period: '/yr',
    badge: 'Best Value',
    perDay: '€0.16/day · Save 50%',
    url: 'https://quantdrill.com/subscribe?plan=yearly',
  },
  {
    key: 'lifetime',
    label: 'Lifetime',
    price: '€179',
    period: 'once',
    badge: '🔥 Limited',
    perDay: 'Pay once, train forever',
    url: 'https://quantdrill.com/subscribe?plan=lifetime',
  },
];

const PREMIUM_FEATURES = [
  {
    icon: <InfinityIcon size={15} className="text-neon-cyan" />,
    label: 'Train Without Limits',
    sub: 'Unlimited daily drills across all categories',
  },
  {
    icon: <Zap size={15} className="text-neon-purple" />,
    label: 'All Categories + Hard Mode',
    sub: 'Mental Math, Business Math, GMAT Quant & more',
  },
  {
    icon: <BarChart2 size={15} className="text-neon-orange" />,
    label: 'Advanced Performance Analytics',
    sub: 'Speed trends, improvement tracking, percentiles',
  },
  {
    icon: <Award size={15} className="text-yellow-400" />,
    label: 'Full Achievement System',
    sub: '22 badges across 6 performance categories',
  },
  {
    icon: <Lock size={15} className="text-emerald-400" />,
    label: 'Detailed Performance Insights',
    sub: 'Category breakdowns and benchmarking data',
  },
];

export default function Paywall({ onClose }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState(null);

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const user = await base44.auth.me();
      if (user?.is_premium) {
        navigate('/');
      } else {
        setRefreshMsg('No active subscription found yet.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  const handleCheckout = async () => {
    const plan = PLANS.find(p => p.key === selected);
    if (!plan) return;
    setLoading(true);
    try {
      const { base44 } = await import('@/api/base44Client');
      const res = await base44.functions.invoke('stripeCheckout', { plan: selected });
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader title="" onBack={handleClose} />

      <div className="flex-1 flex flex-col px-5 pt-4 pb-8 overflow-y-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
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

        {/* Plan selector */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="space-y-2.5 mb-6"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Choose Your Plan</p>
          {PLANS.map(plan => (
            <button
              key={plan.key}
              onClick={() => setSelected(plan.key)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl border transition-all no-select ${
                selected === plan.key
                  ? 'bg-primary/10 border-primary'
                  : 'bg-surface-2 border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                  selected === plan.key ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {selected === plan.key && <Check size={11} className="text-white" />}
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
                  <p className="text-[11px] text-muted-foreground mt-0.5">{plan.perDay}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-grotesk font-bold text-foreground">{plan.price}</span>
                <span className="text-xs text-muted-foreground ml-1">{plan.period}</span>
              </div>
            </button>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="mt-auto"
        >
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-base py-4 rounded-2xl glow-purple active:scale-95 transition-all no-select mb-3 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Train Without Limits →</>
            )}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Cancel anytime · No ads · Secure payment
          </p>

          <button
            onClick={handleRefreshStatus}
            disabled={refreshing}
            className="w-full flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors no-select disabled:opacity-50 mt-1"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Already subscribed? Tap to refresh
          </button>
          {refreshMsg && (
            <p className="text-center text-xs text-muted-foreground -mt-1">{refreshMsg}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}