import { motion } from 'framer-motion';
import { Zap, TrendingUp, DivideSquare, BarChart2, Globe, Target, Percent, Calculator, Scale, PieChart } from 'lucide-react';

const subtypeConfig = {
  // Mental math
  multiplication:       { label: 'Multiplication',      icon: Zap,          color: 'text-neon-cyan' },
  division:             { label: 'Division',             icon: DivideSquare, color: 'text-neon-orange' },
  estimation:           { label: 'Estimation',           icon: Calculator,   color: 'text-neon-purple' },
  // Percentages & growth
  percentage_change:    { label: 'Percentage Change',    icon: TrendingUp,   color: 'text-neon-purple' },
  percentage_of_total:  { label: '% of Total',           icon: Percent,      color: 'text-neon-cyan' },
  percent_of_percent:   { label: '% of %',               icon: Percent,      color: 'text-neon-orange' },
  growth_rate:          { label: 'Growth Rate',          icon: TrendingUp,   color: 'text-emerald-400' },
  // Business math
  profit_margin:        { label: 'Profit Margin',        icon: PieChart,     color: 'text-neon-cyan' },
  breakeven:            { label: 'Breakeven',            icon: Scale,        color: 'text-neon-orange' },
  revenue:              { label: 'Revenue',              icon: BarChart2,    color: 'text-neon-purple' },
  contribution_margin:  { label: 'Contribution Margin',  icon: PieChart,     color: 'text-emerald-400' },
  // Market sizing
  market_sizing:        { label: 'Market Sizing',        icon: Globe,        color: 'text-neon-orange' },
  // GMAT
  arithmetic:           { label: 'Arithmetic',           icon: Calculator,   color: 'text-neon-cyan' },
  algebra:              { label: 'Algebra',              icon: Target,       color: 'text-neon-purple' },
  ratio:                { label: 'Ratio & Proportion',   icon: Scale,        color: 'text-neon-orange' },
  word_problem:         { label: 'Word Problem',         icon: BarChart2,    color: 'text-emerald-400' },
};

const fallback = { label: 'Mental Math', icon: Zap, color: 'text-neon-cyan' };

export default function QuestionCard({ question, questionNumber, total }) {
  const cfg = subtypeConfig[question.subtype] || fallback;
  const Icon = cfg.icon;

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className={cfg.color} />
        <span className={`text-xs font-medium tracking-widest uppercase ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      <p className="text-xl sm:text-2xl font-grotesk font-semibold text-foreground leading-snug">
        {question.prompt}
      </p>
    </motion.div>
  );
}