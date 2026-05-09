/**
 * QUERY SAFETY ENFORCEMENT LAYER
 * 
 * All Session queries MUST pass through these helpers.
 * This prevents unscoped queries and enforces user_id-based ownership.
 */

import { base44 } from '@/api/base44Client';

/**
 * Safe Session query — REQUIRED scoping by user_id
 * 
 * @param {string} userId - Authenticated user's UUID (from base44.auth.me().id)
 * @param {string} sortBy - Field to sort by (e.g., '-created_date')
 * @param {number} limit - Max records to return
 * @returns {Promise<Array>} Filtered sessions for this user only
 * @throws {Error} If userId is missing or invalid
 */
export async function getSessionsForUser(userId, sortBy = '-created_date', limit = 100) {
  if (!userId) {
    throw new Error('querySafety: userId is required. User must be authenticated.');
  }
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('querySafety: userId must be a non-empty string (UUID).');
  }

  return base44.entities.Session.filter({ user_id: userId }, sortBy, limit);
}

/**
 * Safe Session query with custom filter — ENFORCES user_id scoping
 * 
 * @param {string} userId - Authenticated user's UUID
 * @param {Object} additionalFilters - Extra filters (e.g., { category: 'mental_math' })
 * @param {string} sortBy - Field to sort by
 * @param {number} limit - Max records
 * @returns {Promise<Array>} Filtered sessions
 * @throws {Error} If filter attempts to override user_id or if userId missing
 */
export async function getSessionsForUserWithFilters(userId, additionalFilters = {}, sortBy = '-created_date', limit = 100) {
  if (!userId) {
    throw new Error('querySafety: userId is required. User must be authenticated.');
  }
  if (additionalFilters.user_id && additionalFilters.user_id !== userId) {
    throw new Error('querySafety: Attempted to override user_id in query. This is forbidden.');
  }

  // ENFORCE: Always include user_id in filter
  const safeFilters = {
    ...additionalFilters,
    user_id: userId
  };

  return base44.entities.Session.filter(safeFilters, sortBy, limit);
}

/**
 * Validate that a session belongs to the authenticated user
 * 
 * @param {string} userId - Authenticated user's UUID
 * @param {Object} session - Session record to validate
 * @returns {boolean} True if session belongs to user
 * @throws {Error} If session does not belong to user (security violation)
 */
export function validateSessionOwnership(userId, session) {
  if (!userId || !session) {
    throw new Error('querySafety: userId and session are both required.');
  }

  if (session.user_id !== userId) {
    // SECURITY: Log potential data leak attempt
    console.error(`SECURITY: Attempted access to session ${session.id} by unauthorized user ${userId}`);
    throw new Error('querySafety: Access denied. Session does not belong to authenticated user.');
  }

  return true;
}

/**
 * Safe batch validation — verify all sessions belong to user
 * 
 * @param {string} userId - Authenticated user's UUID
 * @param {Array<Object>} sessions - Sessions to validate
 * @throws {Error} If any session doesn't belong to user
 */
export function validateSessionsOwnership(userId, sessions) {
  for (const session of sessions) {
    if (session.user_id !== userId) {
      console.error(`SECURITY: Batch validation failed. Session ${session.id} doesn't belong to user ${userId}`);
      throw new Error('querySafety: Batch validation failed. One or more sessions do not belong to authenticated user.');
    }
  }
  return true;
}

/**
 * REJECT unscoped queries — fail-safe enforcement
 * 
 * This wrapper prevents accidental `.list()` or unscoped `.filter()` calls
 * 
 * @throws {Error} Always throws to prevent unscoped queries
 */
export function preventUnsccopedQuery() {
  throw new Error(
    'querySafety: Unscoped Session queries are forbidden for data safety. ' +
    'Use getSessionsForUser(userId) or getSessionsForUserWithFilters(userId, filters) instead.'
  );
}