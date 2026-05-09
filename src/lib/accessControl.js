/**
 * SINGLE SOURCE OF TRUTH FOR ALL ACCESS CONTROL
 * All permission decisions in the app must use getUserAccess() exclusively.
 * No component is allowed to implement its own permission logic.
 */

const PREMIUM_LOCKED_CATEGORIES = ['gmat_quant', 'market_sizing'];

/**
 * Unified access control function.
 * Returns whether a user can access a specific category + difficulty combination.
 * 
 * @param {Object} user - User object from base44.auth.me()
 * @param {string} category - Category key (e.g., 'daily', 'mental_math', 'gmat_quant')
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns {boolean} - true if user can access this combination, false otherwise
 */
export function getUserAccess(user, category, difficulty) {
  // No user = no access
  if (!user) return false;

  const isPremium = user.stripe_customer_id && user.subscription_status === 'active';

  // Premium users get everything
  if (isPremium) return true;

  // Free users: check restrictions
  
  // 1. GMAT/GRE Quant and Market Sizing are fully locked for free users
  if (PREMIUM_LOCKED_CATEGORIES.includes(category)) {
    return false;
  }

  // 2. All other categories: Easy and Medium allowed, Hard locked for free users
  if (difficulty === 'hard') {
    return false;
  }

  // Easy and Medium are allowed for free users in unrestricted categories
  return true;
}

/**
 * Debug helper to verify access control state.
 * Returns detailed breakdown of user's access for all categories and difficulties.
 * 
 * @param {Object} user - User object from base44.auth.me()
 * @returns {Object} - Debug info with isPremium status and access matrix
 */
export function accessDebugInfo(user) {
  const isPremium = user?.stripe_customer_id && user?.subscription_status === 'active';

  const allCategories = ['daily', 'mental_math', 'percentages_growth', 'business_math', 'gmat_quant', 'market_sizing'];
  const difficulties = ['easy', 'medium', 'hard'];

  const categoryAccess = {};
  allCategories.forEach(cat => {
    categoryAccess[cat] = {
      easy: getUserAccess(user, cat, 'easy'),
      medium: getUserAccess(user, cat, 'medium'),
      hard: getUserAccess(user, cat, 'hard'),
    };
  });

  return {
    user: user?.email || 'none',
    isPremium,
    subscription_status: user?.subscription_status || 'none',
    stripe_customer_id: user?.stripe_customer_id || 'none',
    categoryAccess,
  };
}

/**
 * Helper: Check if a category is fully locked for this user.
 * Used for UI (graying out cards, showing lock icons).
 */
export function isCategoryLocked(user, category) {
  // A category is locked if user cannot access ANY difficulty in it
  return !getUserAccess(user, category, 'easy');
}

/**
 * Helper: Get the minimum difficulty accessible in a category.
 * Used for pre-selecting difficulty in modals.
 */
export function getMinAccessibleDifficulty(user, category) {
  if (getUserAccess(user, category, 'easy')) return 'easy';
  if (getUserAccess(user, category, 'medium')) return 'medium';
  if (getUserAccess(user, category, 'hard')) return 'hard';
  return null; // Category fully locked
}