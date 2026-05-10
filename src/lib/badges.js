// QuantDrill Achievement System
import { BADGES_PART_1 } from './badgesDataPart1';
import { BADGES_PART_2 } from './badgesDataPart2';
import { BADGES_PART_3 } from './badgesDataPart3';

export const BADGES = [
  ...BADGES_PART_1,
  ...BADGES_PART_2,
  ...BADGES_PART_3,
];

export const CATEGORY_LABELS = {
  mental_math:        '⚡ Mental Math',
  percentages_growth: '📈 % & Growth',
  business_math:      '💼 Business Math',
  market_sizing:      '🌍 Market Sizing',
  gmat_quant:         '🎯 GMAT/GRE Quant',
  daily:              '🔀 Daily Mix',
  general:            '🏅 General',
  streaks:            '🔥 Streaks',
  volume:             '🚀 Volume',
  accuracy:           '✨ Accuracy',
  speed:              '⚡ Speed',
  mastery:            '👑 Mastery',
  difficulty:         '🔥 Difficulty',
  time_of_day:        '⏰ Time of Day',
  special:            '🎯 Special Milestones',
  fun:                '🎊 Fun & Personality',
};

/** Compute full badge context from sessions + streak */
export function computeBadgeContext(sessions, streak) {
  const totalDrills = sessions.length;
  const catCount = {};
  const catBest = {};
  const catAccSum = {};
  const catAvgAcc = {};
  let maxScore = 0;
  let perfectCount = 0;
  let hardCount = 0;

  for (const s of sessions) {
    const cat = s.category || 'daily';
    catCount[cat] = (catCount[cat] || 0) + 1;
    if (!catBest[cat] || s.score > catBest[cat]) catBest[cat] = s.score;
    if (s.score > maxScore) maxScore = s.score;
    catAccSum[cat] = (catAccSum[cat] || 0) + (s.accuracy || 0);
    if (s.score === 100) perfectCount++;
    if (s.difficulty === 'hard') hardCount++;
  }

  for (const cat of Object.keys(catCount)) {
    catAvgAcc[cat] = Math.round(catAccSum[cat] / catCount[cat]);
  }

  // High accuracy streak: 5 consecutive sessions with accuracy >= 90
  let highAccStreak5 = false;
  if (sessions.length >= 5) {
    for (let i = 0; i <= sessions.length - 5; i++) {
      if (sessions.slice(i, i + 5).every(s => (s.accuracy || 0) >= 90)) {
        highAccStreak5 = true;
        break;
      }
    }
  }

  // Speed badges: avg_time thresholds with score >= 70
  const speedSub10_1 = sessions.some(s => (s.avg_time || 999) <= 10 && s.score >= 70);
  const speedSub8_1  = sessions.some(s => (s.avg_time || 999) <= 8  && s.score >= 70);
  const speedSub6_1  = sessions.some(s => (s.avg_time || 999) <= 6  && s.score >= 70);

  // Time-of-day badges (use created_date)
  let trainedEarly = false;
  let trainedLate = false;
  let trainedWeekend = false;
  for (const s of sessions) {
    if (!s.created_date) continue;
    const d = new Date(s.created_date);
    const h = d.getHours();
    if (h < 7) trainedEarly = true;
    if (h >= 22) trainedLate = true;
    const day = d.getDay();
    if (day === 0 || day === 6) trainedWeekend = true;
  }

  // Improving streak: last 3 sessions each scored higher than previous
  let improvingStreak3 = false;
  if (sessions.length >= 3) {
    const last3 = sessions.slice(-3);
    improvingStreak3 = last3[1].score > last3[0].score && last3[2].score > last3[1].score;
  }

  return {
    totalDrills, streak, catCount, catBest, catAvgAcc, maxScore,
    perfectCount, hardCount,
    highAccStreak5,
    speedSub10_1, speedSub8_1, speedSub6_1,
    trainedEarly, trainedLate, trainedWeekend,
    improvingStreak3,
  };
}

/**
 * EXPLICIT ENTITLEMENT GROUPS — source of truth.
 * FREE_BADGES  = exactly 22 items (always)
 * PRO_BADGES   = exactly 178 items (always)
 * TOTAL_BADGES = 200 (fixed constant — never derived from BADGES.length)
 */
const FREE_BADGE_ID_LIST = [
  // 7 General
  'first_drill', 'streak_7', 'streak_30', 'drills_10', 'drills_100', 'drills_500', 'perfect_score',
  // 3 Mental Math
  'speed_calculator', 'division_master', 'mental_elite',
  // 3 Percentages
  'percentage_assassin', 'growth_analyst', 'compound_master',
  // 3 Business Math
  'margin_machine', 'profit_hunter', 'boardroom_ready',
  // 3 Market Sizing
  'estimation_expert', 'market_mapper', 'case_cracker',
  // 3 GMAT Quant
  'quant_sprint', 'gmat_grinder', 'quant_elite',
];

const FREE_BADGE_ID_SET = new Set(FREE_BADGE_ID_LIST);

export const FREE_BADGES  = BADGES.filter(b => FREE_BADGE_ID_SET.has(b.id));
export const PRO_BADGES   = BADGES.filter(b => !FREE_BADGE_ID_SET.has(b.id));

/** Fixed product constant — never use BADGES.length in UI */
export const TOTAL_BADGES = 200;

/** Kept for backwards compatibility with existing code */
export const PREMIUM_BADGE_IDS = new Set(PRO_BADGES.map(b => b.id));