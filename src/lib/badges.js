// QuantDrill Achievement System

export const BADGES = [
  // ── General ──────────────────────────────────────────────────────
  {
    id: 'first_drill',
    label: 'First Rep',
    description: 'Complete your first drill',
    category: 'general',
    emoji: '🎯',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    check: ({ totalDrills }) => totalDrills >= 1,
  },
  {
    id: 'streak_7',
    label: '7-Day Streak',
    description: 'Train 7 consecutive days',
    category: 'general',
    emoji: '🔥',
    color: 'text-neon-orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    check: ({ streak }) => streak >= 7,
  },
  {
    id: 'streak_30',
    label: 'Iron Discipline',
    description: 'Maintain a 30-day streak',
    category: 'general',
    emoji: '⚔️',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    check: ({ streak }) => streak >= 30,
  },
  {
    id: 'drills_10',
    label: 'Warming Up',
    description: 'Complete 10 drills total',
    category: 'general',
    emoji: '💪',
    color: 'text-neon-purple',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    check: ({ totalDrills }) => totalDrills >= 10,
  },
  {
    id: 'drills_100',
    label: 'Centurion',
    description: 'Complete 100 drills total',
    category: 'general',
    emoji: '💯',
    color: 'text-neon-purple',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    check: ({ totalDrills }) => totalDrills >= 100,
  },
  {
    id: 'drills_500',
    label: 'Elite Performer',
    description: 'Complete 500 drills — top 1% territory',
    category: 'general',
    emoji: '🏆',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    check: ({ totalDrills }) => totalDrills >= 500,
  },
  {
    id: 'perfect_score',
    label: 'Perfect Execution',
    description: 'Score 100/100 in any drill',
    category: 'general',
    emoji: '✨',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    check: ({ maxScore }) => maxScore >= 100,
  },

  // ── Mental Math ───────────────────────────────────────────────────
  {
    id: 'speed_calculator',
    label: 'Speed Calculator',
    description: 'Score 80+ in a Mental Math drill',
    category: 'mental_math',
    emoji: '⚡',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    check: ({ catBest }) => (catBest['mental_math'] ?? 0) >= 80,
  },
  {
    id: 'division_master',
    label: 'Division Master',
    description: 'Complete 10 Mental Math drills',
    category: 'mental_math',
    emoji: '➗',
    color: 'text-neon-purple',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    check: ({ catCount }) => (catCount['mental_math'] ?? 0) >= 10,
  },
  {
    id: 'mental_elite',
    label: 'Mental Elite',
    description: 'Average 90%+ accuracy across 5 Mental Math drills',
    category: 'mental_math',
    emoji: '🧠',
    color: 'text-neon-orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    check: ({ catAvgAcc, catCount }) =>
      (catCount['mental_math'] ?? 0) >= 5 && (catAvgAcc['mental_math'] ?? 0) >= 90,
  },

  // ── Percentages & Growth ──────────────────────────────────────────
  {
    id: 'percentage_assassin',
    label: 'Percentage Assassin',
    description: 'Score 80+ in a Percentages drill',
    category: 'percentages_growth',
    emoji: '📈',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    check: ({ catBest }) => (catBest['percentages_growth'] ?? 0) >= 80,
  },
  {
    id: 'growth_analyst',
    label: 'Growth Analyst',
    description: 'Complete 10 Percentages & Growth drills',
    category: 'percentages_growth',
    emoji: '📊',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    check: ({ catCount }) => (catCount['percentages_growth'] ?? 0) >= 10,
  },
  {
    id: 'compound_master',
    label: 'Compound Master',
    description: 'Score 90+ in a Percentages drill',
    category: 'percentages_growth',
    emoji: '🚀',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    check: ({ catBest }) => (catBest['percentages_growth'] ?? 0) >= 90,
  },

  // ── Business Math ─────────────────────────────────────────────────
  {
    id: 'margin_machine',
    label: 'Margin Machine',
    description: 'Score 80+ in a Business Math drill',
    category: 'business_math',
    emoji: '💼',
    color: 'text-neon-orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    check: ({ catBest }) => (catBest['business_math'] ?? 0) >= 80,
  },
  {
    id: 'profit_hunter',
    label: 'Profit Hunter',
    description: 'Complete 10 Business Math drills',
    category: 'business_math',
    emoji: '💰',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    check: ({ catCount }) => (catCount['business_math'] ?? 0) >= 10,
  },
  {
    id: 'boardroom_ready',
    label: 'Boardroom Ready',
    description: 'Score 90+ in a Business Math drill',
    category: 'business_math',
    emoji: '📋',
    color: 'text-neon-purple',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    check: ({ catBest }) => (catBest['business_math'] ?? 0) >= 90,
  },

  // ── Market Sizing ─────────────────────────────────────────────────
  {
    id: 'estimation_expert',
    label: 'Estimation Expert',
    description: 'Score 80+ in a Market Sizing drill',
    category: 'market_sizing',
    emoji: '🌍',
    color: 'text-neon-purple',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    check: ({ catBest }) => (catBest['market_sizing'] ?? 0) >= 80,
  },
  {
    id: 'market_mapper',
    label: 'Market Mapper',
    description: 'Complete 10 Market Sizing drills',
    category: 'market_sizing',
    emoji: '🗺️',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    check: ({ catCount }) => (catCount['market_sizing'] ?? 0) >= 10,
  },
  {
    id: 'case_cracker',
    label: 'Case Cracker',
    description: 'Score 90+ in a Market Sizing drill',
    category: 'market_sizing',
    emoji: '🔍',
    color: 'text-neon-orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    check: ({ catBest }) => (catBest['market_sizing'] ?? 0) >= 90,
  },

  // ── GMAT Quant ────────────────────────────────────────────────────
  {
    id: 'quant_sprint',
    label: 'Quant Sprint',
    description: 'Score 80+ in a GMAT Quant drill',
    category: 'gmat_quant',
    emoji: '🎓',
    color: 'text-neon-orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    check: ({ catBest }) => (catBest['gmat_quant'] ?? 0) >= 80,
  },
  {
    id: 'gmat_grinder',
    label: 'GMAT Grinder',
    description: 'Complete 10 GMAT Quant drills',
    category: 'gmat_quant',
    emoji: '📐',
    color: 'text-neon-purple',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    check: ({ catCount }) => (catCount['gmat_quant'] ?? 0) >= 10,
  },
  {
    id: 'quant_elite',
    label: 'Quant Elite',
    description: 'Score 90+ in a GMAT Quant drill',
    category: 'gmat_quant',
    emoji: '🏅',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    check: ({ catBest }) => (catBest['gmat_quant'] ?? 0) >= 90,
  },
];

export const CATEGORY_LABELS = {
  mental_math:        '⚡ Mental Math',
  percentages_growth: '📈 % & Growth',
  business_math:      '💼 Business Math',
  market_sizing:      '🌍 Market Sizing',
  gmat_quant:         '🎯 GMAT Quant',
  daily:              '🔀 Daily Mix',
  general:            '🏅 General',
};

/** Compute full badge context from sessions + streak */
export function computeBadgeContext(sessions, streak) {
  const totalDrills = sessions.length;
  const catCount = {};
  const catBest = {};
  const catAccSum = {};
  const catAvgAcc = {};
  let maxScore = 0;

  for (const s of sessions) {
    const cat = s.category || 'daily';
    catCount[cat] = (catCount[cat] || 0) + 1;
    if (!catBest[cat] || s.score > catBest[cat]) catBest[cat] = s.score;
    if (s.score > maxScore) maxScore = s.score;
    catAccSum[cat] = (catAccSum[cat] || 0) + (s.accuracy || 0);
  }

  for (const cat of Object.keys(catCount)) {
    catAvgAcc[cat] = Math.round(catAccSum[cat] / catCount[cat]);
  }

  return { totalDrills, streak, catCount, catBest, catAvgAcc, maxScore };
}

/** Premium badges require this set of IDs — unlockable only with premium */
export const PREMIUM_BADGE_IDS = new Set([
  'streak_30', 'drills_500', 'perfect_score',
  'mental_elite', 'compound_master', 'boardroom_ready', 'case_cracker', 'quant_elite',
]);