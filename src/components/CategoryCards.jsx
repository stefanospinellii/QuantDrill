import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import DifficultySheet from '@/components/DifficultySheet';
import { isCategoryLocked } from '@/lib/accessControl';

const CATEGORIES = [
  { key: 'mental_math',        emoji: '⚡', label: 'Mental Math',     sub: 'Speed arithmetic',      accent: 'rgba(0,229,196,0.8)' },
  { key: 'percentages_growth', emoji: '📈', label: '% & Growth',      sub: 'CAGR, margins, rates',  accent: 'rgba(167,139,250,0.8)' },
  { key: 'business_math',      emoji: '💼', label: 'Business Math',   sub: 'Revenue, breakeven',    accent: 'rgba(124,58,237,0.8)' },
  { key: 'gmat_quant',         emoji: '🎯', label: 'GMAT / GRE',      sub: 'Algebra & reasoning',   accent: 'rgba(255,153,51,0.8)', premium: true },
  { key: 'market_sizing',      emoji: '🌍', label: 'Market Sizing',   sub: 'Estimation cases',      accent: 'rgba(52,211,153,0.8)', premium: true },
];

export default function CategoryCards({ difficulty, user, onNeedsAuth }) {
  const navigate = useNavigate();
  const [sheetCategory, setSheetCategory] = useState(null);

  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-3.5" style={{ letterSpacing: '0.13em' }}>
        Focused Practice
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIES.map((cat, i) => {
          const locked = isCategoryLocked(user, cat.key);
          return (
            <motion.button
              key={cat.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                if (locked) navigate('/paywall');
                else setSheetCategory(cat.key);
              }}
              className="group relative flex items-center gap-3 text-left no-select overflow-hidden"
              style={{
                background: locked ? 'rgba(255,255,255,0.01)' : 'hsl(220 16% 12%)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                padding: '14px 14px',
                opacity: locked ? 0.5 : 1,
                transition: 'all 0.22s ease',
              }}
              whileHover={!locked ? {
                borderColor: cat.accent.replace('0.8)', '0.3)'),
                background: 'hsl(220 16% 14%)',
                y: -2,
                transition: { duration: 0.18 },
              } : {}}
            >
              {/* Top glow line on hover */}
              {!locked && (
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${cat.accent.replace('0.8)', '0.5)')}, transparent)` }}
                />
              )}

              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg leading-none"
                style={{
                  background: locked
                    ? 'rgba(255,255,255,0.03)'
                    : `${cat.accent.replace('0.8)', '0.12)')}`,
                  border: `1px solid ${cat.accent.replace('0.8)', '0.12)')}`,
                }}
              >
                {cat.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold leading-tight truncate" style={{ color: locked ? 'rgba(255,255,255,0.35)' : '#fff' }}>
                    {cat.label}
                  </p>
                  {locked && <Lock size={9} className="text-neon-orange shrink-0" />}
                </div>
                <p className="text-[10px] mt-0.5 leading-tight truncate" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {locked ? 'Pro only' : cat.sub}
                </p>
              </div>
            </motion.button>
          );
        })}
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