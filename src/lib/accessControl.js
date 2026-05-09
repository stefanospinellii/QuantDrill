// Category-aware access control for QuantDrill

const PREMIUM_ONLY_CATEGORIES = ['gmat_quant', 'market_sizing'];

/**
 * Determines if a category is accessible to the user
 * @param {string} category - The category key
 * @param {boolean} isPremium - User premium status
 * @returns {boolean} - true if category is accessible
 */
export function isCategoryAccessible(category, isPremium) {
  if (isPremium) return true;
  return !PREMIUM_ONLY_CATEGORIES.includes(category);
}

/**
 * Determines if a specific difficulty is accessible for a category
 * Evaluation order:
 * 1. Check if category is accessible first
 * 2. Then check difficulty restrictions
 * 
 * @param {string} category - The category key
 * @param {string} difficulty - The difficulty key (easy, medium, hard)
 * @param {boolean} isPremium - User premium status
 * @returns {boolean} - true if difficulty is accessible
 */
export function isDifficultyAccessible(category, difficulty, isPremium) {
  // If category is locked entirely, no difficulty is accessible
  if (!isCategoryAccessible(category, isPremium)) {
    return false;
  }

  // Premium users: all difficulties accessible in all accessible categories
  if (isPremium) {
    return true;
  }

  // Free users: Hard is locked everywhere, Easy and Medium allowed
  if (difficulty === 'hard') {
    return false;
  }

  return true;
}