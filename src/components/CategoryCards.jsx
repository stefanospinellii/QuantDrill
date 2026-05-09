import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import DifficultySheet from '@/components/DifficultySheet';
import { isCategoryLocked } from '@/lib/accessControl';

const CATEGORIES = [
  { key: 'mental_math',        emoji: '⚡', label: 'Mental Math',       sub: 'Speed arithmetic' },
  { key: 'percentages_growth', emoji: '📈', label: '% & Growth',        sub: 'CAGR, margins, rates' },
  { key: 'business_math',      emoji: '💼', label: 'Business Math',     sub: 'Revenue, breakeven' },
  { key: 'gmat_quant',         emoji: '🎯', label: 'GMAT/GRE Quant',   sub: 'Algebra & reasoning',  premium: true },
  { key: 'market_sizing',      emoji: '🌍', label: 'Market Sizing',     sub: 'Estimation cases',     premium: true },
];

export default function CategoryCards({ difficulty, user, onNeedsAuth }) {
  const navigate = useNavigate();
  const [sheetCategory, setSheetCategory] = useState(null);

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
            onClick={() => {
              if (isCategoryLocked(user, cat.key)) {
                navigate('/paywall');
              } else {
                setSheetCategory(cat.key);
              }
            }}
            className={`flex items-center gap-3 border rounded-2xl px-3.5 py-3.5 text-left transition-colors active:scale-95 no-select ${
              isCategoryLocked(user, cat.key)
                ? 'bg-surface-1 border-border opacity-50 cursor-default'
                : 'bg-surface-2 border-border hover:border-primary/40'
            }`}
          >
            <span className="text-xl leading-none">{cat.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                  <p className={`text-sm font-semibold leading-tight truncate ${isCategoryLocked(user, cat.key) ? 'text-muted-foreground' : 'text-foreground'}`}>{cat.label}</p>
                  {isCategoryLocked(user, cat.key) && <Lock size={10} className="text-neon-orange shrink-0" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight truncate">
                  {isCategoryLocked(user, cat.key) ? 'Premium' : cat.sub}
                </p>
            </div>
          </motion.button>
        ))}
      </div>

      <DifficultySheet
        open={!!sheetCategory}
        value={difficulty}
        category={sheetCategory}
        user={user}
        onClose={() => setSheetCategory(null)}
        onNeedsAuth={onNeedsAuth ? (settings) => {
          setSheetCategory(null);
          onNeedsAuth(settings);
        } : undefined}
        onStart={({ difficulty: d, duration, category }) => {
          setSheetCategory(null);
          navigate(`/drill?difficulty=${d}&category=${category}&duration=${duration}`);
        }}
      />
    </div>
  );
}