import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { key: 'mental_math',        emoji: '⚡', label: 'Mental Math',        sub: 'Speed arithmetic' },
  { key: 'percentages_growth', emoji: '📈', label: '% & Growth',         sub: 'CAGR, margins, rates' },
  { key: 'business_math',      emoji: '💼', label: 'Business Math',      sub: 'Revenue, breakeven, pricing' },
  { key: 'market_sizing',      emoji: '🌍', label: 'Market Sizing',      sub: 'Estimation & decomposition' },
  { key: 'gmat_quant',         emoji: '🎯', label: 'GMAT Quant',         sub: 'Timed quant reasoning' },
];

export default function CategoryCards({ difficulty }) {
  const navigate = useNavigate();

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-3">
        Focused Practice
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => navigate(`/drill?difficulty=${difficulty}&category=${cat.key}`)}
            className="flex items-center gap-3 bg-surface-2 border border-border rounded-2xl px-3.5 py-3.5 text-left hover:border-primary/40 transition-colors active:scale-95 no-select"
          >
            <span className="text-xl leading-none">{cat.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight truncate">{cat.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight truncate">{cat.sub}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}