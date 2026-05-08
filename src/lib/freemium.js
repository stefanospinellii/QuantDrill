// Freemium gate logic for QuantDrill

export const FREE_DAILY_LIMIT = 25;

/**
 * Returns { allowed, usedToday, remaining, isPremium }
 */
export function getDrillAccess(sessions, user) {
  const isPremium = user?.is_premium === true;
  if (isPremium) return { allowed: true, usedToday: 0, remaining: Infinity, isPremium: true };

  const today = new Date().toISOString().split('T')[0];
  const usedToday = sessions.filter(s => s.date === today).length;
  const remaining = Math.max(0, FREE_DAILY_LIMIT - usedToday);
  return { allowed: remaining > 0, usedToday, remaining, isPremium: false };
}