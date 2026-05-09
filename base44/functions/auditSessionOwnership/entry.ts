/**
 * PRODUCTION DATA INTEGRITY AUDIT & REPAIR
 * 
 * This function audits all Session records for ownership integrity:
 * - Identifies records missing user_id
 * - Attempts to backfill user_id from email (if User.email matches)
 * - Flags orphaned records for manual review
 * - Ensures complete data integrity before production
 * 
 * This is an ADMIN-ONLY function (must be called by admin user).
 * Use it as: base44.functions.invoke('auditSessionOwnership', {})
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // ADMIN VERIFICATION: Only admins can run data audits
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    console.log('[AUDIT] Starting Session ownership integrity audit...');

    // ────────────────────────────────────────────────────────────────
    // PHASE 1: IDENTIFY ISSUES
    // ────────────────────────────────────────────────────────────────

    const allSessions = await base44.asServiceRole.entities.Session.list();
    console.log(`[AUDIT] Total sessions in database: ${allSessions.length}`);

    const withoutUserId = allSessions.filter(s => !s.user_id);
    console.log(`[AUDIT] Sessions without user_id: ${withoutUserId.length}`);

    if (withoutUserId.length === 0) {
      console.log('[AUDIT] ✅ All sessions have valid user_id. No action needed.');
      return Response.json({
        status: 'PASS',
        totalSessions: allSessions.length,
        recordsWithoutUserId: 0,
        backfilled: 0,
        orphaned: 0,
        message: 'All sessions have valid ownership.'
      });
    }

    // ────────────────────────────────────────────────────────────────
    // PHASE 2: ATTEMPT BACKFILL
    // ────────────────────────────────────────────────────────────────

    const users = await base44.asServiceRole.entities.User.list();
    const emailToUserId = {};
    for (const u of users) {
      emailToUserId[u.email] = u.id;
    }

    let backfilled = 0;
    let orphaned = 0;
    const orphanedSessions = [];

    for (const session of withoutUserId) {
      if (!session.created_by) {
        console.warn(`[AUDIT] Orphaned: Session ${session.id} has no user_id and no created_by email`);
        orphaned++;
        orphanedSessions.push({ id: session.id, reason: 'missing_created_by' });
        continue;
      }

      const matchedUserId = emailToUserId[session.created_by];
      if (!matchedUserId) {
        console.warn(`[AUDIT] Orphaned: Session ${session.id} has email ${session.created_by} but no matching User`);
        orphaned++;
        orphanedSessions.push({ id: session.id, reason: 'no_matching_user', email: session.created_by });
        continue;
      }

      // SAFE BACKFILL: Update session with matched user_id
      try {
        await base44.asServiceRole.entities.Session.update(session.id, {
          user_id: matchedUserId
        });
        backfilled++;
        console.log(`[AUDIT] Backfilled: Session ${session.id} → user_id: ${matchedUserId}`);
      } catch (updateError) {
        console.error(`[AUDIT] Failed to backfill session ${session.id}:`, updateError.message);
        orphaned++;
        orphanedSessions.push({ id: session.id, reason: 'update_failed', error: updateError.message });
      }
    }

    // ────────────────────────────────────────────────────────────────
    // PHASE 3: VERIFY FINAL STATE
    // ────────────────────────────────────────────────────────────────

    const finalCheck = await base44.asServiceRole.entities.Session.list();
    const stillMissing = finalCheck.filter(s => !s.user_id);

    console.log('[AUDIT] ═══════════════════════════════════════');
    console.log(`[AUDIT] Sessions without user_id (before): ${withoutUserId.length}`);
    console.log(`[AUDIT] Sessions backfilled: ${backfilled}`);
    console.log(`[AUDIT] Orphaned records: ${orphaned}`);
    console.log(`[AUDIT] Sessions without user_id (after): ${stillMissing.length}`);
    console.log('[AUDIT] ═══════════════════════════════════════');

    const status = stillMissing.length === 0 ? 'PASS' : 'FAIL_ORPHANS_REMAIN';

    return Response.json({
      status,
      totalSessions: allSessions.length,
      recordsWithoutUserId: withoutUserId.length,
      backfilled,
      orphaned,
      orphanedSessionIds: orphanedSessions,
      finalCheck: {
        stillMissingCount: stillMissing.length,
        stillMissingIds: stillMissing.map(s => s.id)
      },
      message: stillMissing.length === 0
        ? '✅ PASS: All sessions have valid user_id ownership.'
        : `⚠️ FAIL: ${stillMissing.length} orphaned records remain. Manual review required.`
    });

  } catch (error) {
    console.error('[AUDIT] Error during audit:', error);
    return Response.json(
      { 
        error: 'Audit failed',
        message: error.message,
        status: 'ERROR'
      },
      { status: 500 }
    );
  }
});