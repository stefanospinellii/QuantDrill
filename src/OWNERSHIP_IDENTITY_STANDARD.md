# QuantDrill Session Ownership: Architecture Analysis

## ⚠️ CRITICAL FINDING: MIXED OWNERSHIP MODEL DETECTED

---

## ISSUE SUMMARY

Your concern is **justified and valid**. The codebase currently uses **TWO different ownership identifiers**:

| Identifier | Usage | Risk Level |
|---|---|---|
| `created_by: user.email` | READ queries (99% of code) | 🟡 MEDIUM |
| `user_id: user?.id` | WRITE only (Session creation) | 🟡 MEDIUM |

This is a **latent architectural risk** that works *by coincidence* today but is **not safe by design**.

---

## 1. EXACT USAGE MAP

### WRITES: Use `user_id` (UUID)

**File: `pages/Drill.jsx:77`**
```javascript
await base44.entities.Session.create({
  // ... other fields
  user_id: user?.id,  // ← UUID (not email)
});
```

### READS: Use `created_by` (Email)

| File | Line | Query |
|---|---|---|
| `pages/Home.jsx` | 45 | `.filter({ created_by: user.email })` |
| `pages/Progress.jsx` | 29 | `.filter({ created_by: u.email })` |
| `pages/Badges.jsx` | 37 | `.filter({ created_by: u.email })` |
| `components/ProfileModal.jsx` | 35 | `.filter({ created_by: user?.email })` |

**Every read uses `user.email`.**  
**Every write sets `user_id` (but `created_by` is auto-set by Base44).**

---

## 2. WHY THIS IS CURRENTLY SAFE (BUT FRAGILE)

### Current state:
```
Session.create({
  user_id: "uuid-123",           ← manually set
  created_by: "alice@gmail.com"  ← auto-set by Base44 SDK
})

Session.filter({ created_by: "alice@gmail.com" })  ← reads using email
```

**Why it works**:
1. Base44 auto-sets `created_by` on every record (user's email)
2. All reads filter by this email
3. UUIDs and emails don't collide
4. Within a single session, same user → same email

**Why it's fragile**:
1. ❌ If email changes (account migration, provider switch), old sessions become orphaned
2. ❌ If auth provider changes (OAuth provider → email), mismatch possible
3. ❌ If Base44 stops auto-setting `created_by`, reads break
4. ❌ If someone manually creates Session with wrong `user_id`, data is accessible via email (inconsistency)
5. ❌ **No database constraint** enforces `user_id` == `User[email].id`

---

## 3. THE ARCHITECTURAL PROBLEM

### Current model (MIXED):
```
┌─────────────────────────────────────────┐
│ Session Record                          │
├─────────────────────────────────────────┤
│ id: "session-456"                       │
│ user_id: "user-uuid-123"    ← WRITE    │
│ created_by: "alice@gmail"   ← READ     │
│ date: "2026-05-09"                      │
│ score: 85                               │
└─────────────────────────────────────────┘

Query path: created_by = email
Ownership: user_id = UUID (unused for queries!)
```

**Problem**: Two separate ownership fields with no constraint linking them.

### Correct model (UNIFIED):
```
┌─────────────────────────────────────────┐
│ Session Record                          │
├─────────────────────────────────────────┤
│ id: "session-456"                       │
│ user_id: "user-uuid-123"    ← CANONICAL│
│ created_by: (auto-set, unused)          │
│ date: "2026-05-09"                      │
│ score: 85                               │
└─────────────────────────────────────────┘

ALL queries: user_id = UUID
Ownership: ONLY user_id (single source)
```

---

## 4. EDGE CASE RISKS (PROOF)

### Risk 1: Email Provider Migration

**Scenario**: User logs in via Google, sessions created:
```
Session {
  user_id: "uuid-abc123",
  created_by: "alice@gmail.com"  (Google OAuth)
}
```

User switches to email/password auth, same email but different provider:
```
// Provider mismatch but email unchanged
// created_by still works: "alice@gmail.com"
// But if Base44 ever de-duplicates by email → ambiguity
```

### Risk 2: Email Change / Account Recovery

If user changes email or recovers account:
```
Old: user_id = "uuid-abc123", created_by = "alice@gmail.com"
New: user_id = "uuid-abc123", created_by = "alice.new@gmail.com"

// Old sessions now unreachable via .filter({ created_by })
// But still linked via user_id!
// Orphaned data risk.
```

### Risk 3: Manual Data Migration

If someone manually updates User.email without cascading Sessions:
```
UPDATE User SET email = 'newemail@...' WHERE id = 'uuid-abc123'
// Sessions still have created_by = 'oldemail@...'
// Query filter breaks!
```

---

## 5. WHAT BASE44 GUARANTEES

From Base44 SDK behavior:

✅ `created_by` is **auto-set** on every create to authenticated user's email  
✅ `created_by` is immutable (cannot be changed)  
❌ No constraint linking `user_id` to User records  
❌ `created_by` is **not** validated against User.email  
❌ No cascade rules on email changes  

---

## 6. RECOMMENDATIONS

### Option A: Keep `email` as canonical (simplest, lowest risk)

**Rationale**: Base44 already auto-sets `created_by`, so leverage it.

**Changes**:
1. Remove manual `user_id` from Drill.jsx (optional, doesn't hurt)
2. Document that `created_by` is the sole ownership field
3. Add a constraint/trigger (if Base44 supports) to validate `created_by` matches User.email

**Pros**:
- ✅ Already in use (lowest code change)
- ✅ Base44 handles it automatically
- ✅ Email-based queries are natural

**Cons**:
- ⚠️ Email is mutable (user could theoretically change it)
- ⚠️ Depends on Base44 behavior

---

### Option B: Switch to `user_id` as canonical (most robust) ⭐ RECOMMENDED

**Rationale**: UUID is immutable, cannot be reassigned, more resilient.

**Changes**:
1. ✅ Drill.jsx already sets `user_id` (DONE)
2. ⚠️ **Update ALL read queries**: Change `.filter({ created_by })` → `.filter({ user_id })`
3. Add database constraint: `user_id` must match a real User.id

**Pros**:
- ✅ UUID is globally unique and immutable
- ✅ Works across email changes / provider migrations
- ✅ Canonical ownership field (single source of truth)
- ✅ Prevents orphaned data issues

**Cons**:
- 🔧 Requires code changes in 4 files (Progress, Badges, Home, ProfileModal)
- ⚠️ Requires data migration for existing sessions (set missing user_id values)

---

## 7. IMPLEMENTATION: MIGRATE TO user_id (RECOMMENDED)

### Step 1: Update Schema (Add NOT NULL constraint)

```json
{
  "user_id": {
    "type": "string",
    "description": "User ID (canonical ownership identifier)",
    "nullable": false
  }
}
```

### Step 2: Fix All Read Queries

**Home.jsx (line 45)**:
```javascript
// OLD: .filter({ created_by: user.email }, '-created_date', 20)
// NEW:
.filter({ user_id: user?.id }, '-created_date', 20)
```

**Progress.jsx (line 29)**:
```javascript
// OLD: .filter({ created_by: u.email }, '-date', 200)
// NEW:
.filter({ user_id: u?.id }, '-date', 200)
```

**Badges.jsx (line 37)**:
```javascript
// OLD: .filter({ created_by: u.email }, '-date', 500)
// NEW:
.filter({ user_id: u?.id }, '-date', 500)
```

**ProfileModal.jsx (line 35)**:
```javascript
// OLD: .filter({ created_by: user?.email }, '-created_date', 1000)
// NEW:
.filter({ user_id: user?.id }, '-created_date', 1000)
```

### Step 3: Data Migration (if production has sessions without user_id)

```javascript
// One-time script to backfill user_id on existing sessions
// For each Session with empty user_id:
//   1. Get created_by (email)
//   2. Look up User by email
//   3. Set Session.user_id = User.id
```

---

## 8. SECURITY IMPLICATIONS

### Current (Mixed Model):
```
Risk Matrix:
┌─────────────────────────────────────────┐
│ Email changes        → Data orphaned     │
│ Provider switches    → Ambiguity risk    │
│ Manual migrations    → Inconsistency     │
│ Base44 SDK changes   → Uncontrolled      │
└─────────────────────────────────────────┘

Verdict: SAFE by convention, NOT safe by architecture
```

### After Migration (UUID Canonical):
```
Risk Matrix:
┌─────────────────────────────────────────┐
│ Email changes        → No impact ✅      │
│ Provider switches    → No impact ✅      │
│ Manual migrations    → UUID unchanged ✅ │
│ Base44 SDK changes   → Independent ✅    │
└─────────────────────────────────────────┘

Verdict: SAFE by architecture
```

---

## 9. VERDICT

| Aspect | Current | After Migration |
|---|---|---|
| Ownership model | Mixed (email + UUID) | Unified (UUID only) |
| Safety by design | ❌ No | ✅ Yes |
| Email resilience | ❌ Breaks on change | ✅ Immune |
| Future-proof | ⚠️ Convention-dependent | ✅ Architecture-guaranteed |
| Recommended | ⚠️ Works, but fragile | ✅ Recommended |

---

## 10. ACTION ITEMS

**Immediate** (this sprint):
- [ ] Decision: Accept mixed model OR migrate to UUID
- [ ] If migrate: Update Session schema + mark `user_id` as `nullable: false`

**Short-term** (if migrating):
- [ ] Replace 4 read queries (Home, Progress, Badges, ProfileModal)
- [ ] Run data migration on production (backfill `user_id`)
- [ ] Test end-to-end (create session, fetch by user_id, verify isolation)

**Long-term**:
- [ ] Add database constraints (`user_id` references User.id)
- [ ] Document ownership model in README
- [ ] Add linting rule to prevent `created_by` queries

---

## CONCLUSION

**Your observation is 100% correct**: this is a **mixed ownership model** that is **currently safe but not safe by design**.

**Recommendation**: Migrate to `user_id` as canonical. This takes ~1 hour of work but makes the system **deterministically safe** rather than **conventionally safe**.

Current risk level: 🟡 **MEDIUM** (works today, breaks tomorrow)  
After migration: 🟢 **LOW** (architectural guarantee)

---

**Last Updated**: 2026-05-09  
**Status**: REQUIRES DECISION