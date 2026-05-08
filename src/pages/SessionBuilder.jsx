import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ChevronRight, Check } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';

const CATEGORIES = [
  { key: 'mental_math',        emoji: '⚡', label: 'Mental Math',       sub: 'Speed arithmetic & estimation' },
  { key: 'percentages_growth', emoji: '📈', label: '% & Growth',        sub: 'CAGR, margins, rates' },
  { key: 'business_math',      emoji: '💼', label: 'Business Math',     sub: 'Revenue, breakeven, pricing' },
  { key: 'gmat_quant',         emoji: '🎯', label: 'GMAT Quant',        sub: 'Algebra, ratios, word problems', premium: true },
  { key: 'market_sizing',      emoji: '🌍', label: 'Market Sizing',     sub: 'Estimation & decomposition', premium: true },
];

const DIFFICULTIES = [
  { key: 'easy',   label: 'Easy',   sub: 'Beginner-friendly calculations' },
  { key: 'medium', label: 'Medium', sub: 'Standard consulting / GMAT level' },
  { key: 'hard',   label: 'Hard',   sub: 'Advanced reasoning & mental math', premium: true },
];

const DURATIONS = [
  { minutes: 2,  label: '2 min',  sub: 'Quick warmup' },
  { minutes: 5,  label: '5 min',  sub: 'Focused session' },
  { minutes: 10, label: '10 min', sub: 'Full drill' },
];

export default function SessionBuilder() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('mental_math');
  const [difficulty, setDifficulty] = useState('medium');
  const [duration, setDuration] = useState(5);

  const canStart = CATEGORIES.find(c => c.key === category && !c.premium) !== undefined || true;

  const handleStart = () => {
    const cat = CATEGORIES.find(c => c.key === category);
    const diff = DIFFICULTIES.find(d => d.key === difficulty);
    if (cat?.premium || diff?.premium) {
      navigate('/paywall');
      return;
    }
    navigate(`/drill?difficulty=${difficulty}&category=${category}&duration=${duration}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-8">
      <MobileHeader title="New Session" />

      <div className="flex-1 overflow-y-auto px-5 pt-6 space-y-7">

        {/* Category */}
        <Section label="Category" delay={0}>
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => !cat.premium && setCategory(cat.key)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left no-select transition-all ${
                  category === cat.key && !cat.premium
                    ? 'bg-primary/10 border-primary'
                    : 'bg-surface-2 border-border'
                } ${cat.premium ? 'opacity-55' : 'active:scale-[0.98]'}`}
              >
                <span className="text-2xl leading-none">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold leading-tight ${cat.premium ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {cat.label}
                    </p>
                    {cat.premium && (
                      <span className="text-[9px] font-bold text-neon-orange bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.sub}</p>
                </div>
                {category === cat.key && !cat.premium && (
                  <Check size={16} className="text-primary shrink-0" />
                )}
                {cat.premium && (
                  <Lock size={14} className="text-muted-foreground shrink-0" />
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Difficulty */}
        <Section label="Difficulty" delay={0.06}>
          <div className="flex gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.key}
                onClick={() => !d.premium && setDifficulty(d.key)}
                className={`flex-1 flex flex-col items-center py-3.5 rounded-2xl border text-center no-select transition-all ${
                  difficulty === d.key && !d.premium
                    ? 'bg-primary/10 border-primary'
                    : 'bg-surface-2 border-border'
                } ${d.premium ? 'opacity-55' : 'active:scale-[0.97]'}`}
              >
                <p className={`text-sm font-semibold leading-tight ${d.premium ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {d.label}
                </p>
                {d.premium ? (
                  <span className="text-[9px] font-bold text-neon-orange mt-1">Premium</span>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-1 leading-tight px-1">{d.sub}</p>
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Duration */}
        <Section label="Session Duration" delay={0.12}>
          <div className="flex gap-2">
            {DURATIONS.map(d => (
              <button
                key={d.minutes}
                onClick={() => setDuration(d.minutes)}
                className={`flex-1 flex flex-col items-center py-3.5 rounded-2xl border no-select transition-all active:scale-[0.97] ${
                  duration === d.minutes
                    ? 'bg-primary/10 border-primary'
                    : 'bg-surface-2 border-border'
                }`}
              >
                <p className={`text-base font-grotesk font-bold ${duration === d.minutes ? 'text-primary' : 'text-foreground'}`}>
                  {d.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{d.sub}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2.5 text-center">
            Questions flow continuously until time runs out
          </p>
        </Section>

      </div>

      {/* Start CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 pt-4"
      >
        <button
          onClick={handleStart}
          className="w-full bg-primary text-primary-foreground font-grotesk font-bold text-lg py-4.5 py-[18px] rounded-2xl glow-purple transition-all active:scale-95 no-select flex items-center justify-center gap-2"
        >
          Start Session
          <ChevronRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}

function Section({ label, children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">{label}</p>
      {children}
    </motion.div>
  );
}