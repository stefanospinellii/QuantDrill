import { motion } from 'framer-motion';
import { Zap, TrendingUp, DivideSquare, BarChart2, Globe, Target, Percent, Calculator, Scale, PieChart } from 'lucide-react';

const subtypeConfig = {
  multiplication:       { label: 'Multiplication',      icon: Zap,          color: '#00E5C4',  glow: 'rgba(0,229,196,0.15)' },
  division:             { label: 'Division',             icon: DivideSquare, color: '#FF9933',  glow: 'rgba(255,153,51,0.15)' },
  estimation:           { label: 'Estimation',           icon: Calculator,   color: '#a78bfa',  glow: 'rgba(167,139,250,0.15)' },
  percentage_change:    { label: 'Percentage Change',    icon: TrendingUp,   color: '#a78bfa',  glow: 'rgba(167,139,250,0.15)' },
  percentage_of_total:  { label: '% of Total',           icon: Percent,      color: '#00E5C4',  glow: 'rgba(0,229,196,0.15)' },
  percent_of_percent:   { label: '% of %',               icon: Percent,      color: '#FF9933',  glow: 'rgba(255,153,51,0.15)' },
  growth_rate:          { label: 'Growth Rate',          icon: TrendingUp,   color: '#34D399',  glow: 'rgba(52,211,153,0.15)' },
  profit_margin:        { label: 'Profit Margin',        icon: PieChart,     color: '#00E5C4',  glow: 'rgba(0,229,196,0.15)' },
  breakeven:            { label: 'Breakeven',            icon: Scale,        color: '#FF9933',  glow: 'rgba(255,153,51,0.15)' },
  revenue:              { label: 'Revenue',              icon: BarChart2,    color: '#a78bfa',  glow: 'rgba(167,139,250,0.15)' },
  contribution_margin:  { label: 'Contribution Margin',  icon: PieChart,     color: '#34D399',  glow: 'rgba(52,211,153,0.15)' },
  market_sizing:        { label: 'Market Sizing',        icon: Globe,        color: '#FF9933',  glow: 'rgba(255,153,51,0.15)' },
  arithmetic:           { label: 'Arithmetic',           icon: Calculator,   color: '#00E5C4',  glow: 'rgba(0,229,196,0.15)' },
  algebra:              { label: 'Algebra',              icon: Target,       color: '#a78bfa',  glow: 'rgba(167,139,250,0.15)' },
  ratio:                { label: 'Ratio & Proportion',   icon: Scale,        color: '#FF9933',  glow: 'rgba(255,153,51,0.15)' },
  word_problem:         { label: 'Word Problem',         icon: BarChart2,    color: '#34D399',  glow: 'rgba(52,211,153,0.15)' },
};

const fallback = { label: 'Mental Math', icon: Zap, color: '#00E5C4', glow: 'rgba(0,229,196,0.15)' };

export default function QuestionCard({ question, questionNumber }) {
  const cfg = subtypeConfig[question.subtype] || fallback;
  const Icon = cfg.icon;

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Category tag */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: cfg.glow, border: `1px solid ${cfg.color}25` }}
        >
          <Icon size={12} style={{ color: cfg.color }} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.color, opacity: 0.8, letterSpacing: '0.13em' }}>
          {cfg.label}
        </span>
      </div>

      {/* Question text */}
      <p
        className="font-grotesk font-semibold leading-snug"
        style={{ fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', color: '#fff', lineHeight: 1.45 }}
      >
        {question.prompt}
      </p>
    </motion.div>
  );
}