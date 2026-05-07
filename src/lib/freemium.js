// Freemium rules for QuantDrill

export const FREE_DAILY_DRILLS = 35;

/** Returns true if user can start another drill */
export function canStartDrill(user) {
  if (!user) return true; // allow before load
  if (user.is_premium) return true;

  const today = new Date().toISOString().split('T')[0];
  const resetNeeded = user.drills_today_date !== today;
  const drillsUsed = resetNeeded ? 0 : (user.drills_today || 0);

  return drillsUsed < FREE_DAILY_DRILLS;
}

/** Returns remaining free drills today */
export function remainingDrills(user) {
  if (!user || user.is_premium) return Infinity;
  const today = new Date().toISOString().split('T')[0];
  const resetNeeded = user.drills_today_date !== today;
  const drillsUsed = resetNeeded ? 0 : (user.drills_today || 0);
  return Math.max(0, FREE_DAILY_DRILLS - drillsUsed);
}

/** Increment drills_today on user (call after session created) */
export async function incrementDrillCount(base44) {
  const user = await base44.auth.me();
  const today = new Date().toISOString().split('T')[0];
  const resetNeeded = user.drills_today_date !== today;
  const current = resetNeeded ? 0 : (user.drills_today || 0);
  await base44.auth.updateMe({
    drills_today: current + 1,
    drills_today_date: today,
  });
}