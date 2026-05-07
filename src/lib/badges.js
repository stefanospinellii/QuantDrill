// Badge definitions for QuantDrill achievement system

export const BADGES = [
  // ── General ──────────────────────────────────────────────────────────────
  {
    id: 'first_drill',
    label: 'First Rep',
    description: 'Complete your first drill',
    emoji: '🎯',
    category: 'general',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    check: ({ total }) => total >= 1,
  },
  {
    id: 'seven_day_streak',
    label: '7-Day Streak',
    description: 'Train 7 days in a row',
    emoji: '🔥',
    category: 'general',
    color: 'text-neon-orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    check: ({ streak }) => streak >= 7,
  },
  {
    id: 'drills_100',
    label: 'Century Club',
    description: 'Complete 100 drills',
    emoji: '💯',
    category: 'general',
    color: 'text-neon-purple',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    check: ({ total }) => total >= 100,
  },
  {
    id: 'elite_grinder',
    label: 'Elite Grinder',
    description: 'Complete 500 drills',
    emoji: '🏆',
    category: 'general',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    check: ({ total }) => total >= 500,
  },

  // ── Mental Math ───────────────────────────────────────────────────────────
  {
    id: 'speed_calculator',
    label: 'Speed Calculator',
    description: 'Complete 10 Mental Math drills',
    emoji: '⚡',
    category: 'mental_math',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    check: ({ byCat }) => (byCat.mental_math || 0) >= 10,
  },
  {
    id: 'division_master',
    label: 'Division Master',
    description: 'Score 80+ in 5 Mental Math drills',
    emoji: '➗',
    category: 'mental_math',
    color: 'text-neon-purple',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    check: ({ sessionsByCat }) => (sessionsByCat.mental_math || []).filter(s => s.score >= 80).length >= 5,
  },

  // ── Percentages & Growth ──────────────────────────────────────────────────
  {
    id: 'percentage_assassin',
    label: 'Percentage Assassin',
    description: 'Complete 10 % & Growth drills',
    emoji: '📈',
    category: 'percentages_growth',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    check: ({ byCat }) => (byCat.percentages_growth || 0) >= 10,
  },
  {
    id: 'growth_analyst',
    label: 'Growth Analyst',
    description: 'Average 85%+ accuracy in % & Growth',
    emoji: '🚀',
    category: 'percentages_growth',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    check: ({ sessionsByCat }) => {
      const s = sessionsByCat.percentages_growth || [];
      if (s.length < 3) return false;
      return (s.reduce((a, r) => a + r.accuracy, 0) / s.length) >= 85;
    },
  },

  // ── Business Math ─────────────────────────────────────────────────────────
  {
    id: 'margin_machine',
    label: 'Margin Machine',
    description: 'Complete 10 Business Math drills',
    emoji: '💼',
    category: 'business_math',
    color: 'text-neon-orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    check: ({ byCat }) => (byCat.business_math || 0) >= 10,
  },
  {
    id: 'profit_hunter',
    label: 'Profit Hunter',
    description: 'Score 90+ in 3 Business Math drills',
    emoji: '💰',
    category: 'business_math',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    check: ({ sessionsByCat }) => (sessionsByCat.business_math || []).filter(s => s.score >= 90).length >= 3,
  },

  // ── Market Sizing ─────────────────────────────────────────────────────────
  {
    id: 'estimation_expert',
    label: 'Estimation Expert',
    description: 'Complete 10 Market Sizing drills',
    emoji: '🌍',
    category: 'market_sizing',
    color: 'text-neon-purple',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    check: ({ byCat }) => (byCat.market_sizing || 0) >= 10,
  },
  {
    id: 'market_mapper',
    label: 'Market Mapper',
    description: 'Average 80%+ accuracy in Market Sizing',
    emoji: '🗺️',
    category: 'market_sizing',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    check: ({ sessionsByCat }) => {
      const s = sessionsByCat.market_sizing || [];
      if (s.length < 3) return false;
      return (s.reduce((a, r) => a + r.accuracy, 0) / s.length) >= 80;
    },
  },

  // ── GMAT Quant ────────────────────────────────────────────────────────────
  {
    id: 'quant_sprint',
    label: 'Quant Sprint',
    description: 'Complete 10 GMAT Quant drills',
    emoji: '🎓',
    category: 'gmat_quant',
    color: 'text-neon-orange',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    check: ({ byCat }) => (byCat.gmat_quant || 0) >= 10,
  },
  {
    id: 'gmat_grinder',
    label: 'GMAT Grinder',
    description: 'Score 85+ in 5 GMAT Quant drills',
    emoji: '🧠',
    category: 'gmat_quant',
    color: 'text-neon-purple',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    check: ({ sessionsByCat }) => (sessionsByCat.gmat_quant || []).filter(s => s.score >= 85).length >= 5,
  },
];

/** Compute badge unlock state from sessions + user data */
export function computeBadgeStats(sessions, user) {
  const total = sessions.length;
  const streak = user?.streak_count || 0;

  const byCat = {};
  const sessionsByCat = {};
  for (const s of sessions) {
    const cat = s.category || 'daily';
    byCat[cat] = (byCat[cat] || 0) + 1;
    if (!sessionsByCat[cat]) sessionsByCat[cat] = [];
    sessionsByCat[cat].push(s);
  }

  return { total, streak, byCat, sessionsByCat };
}