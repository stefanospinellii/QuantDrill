import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getSessionsForUser } from '@/lib/querySafety';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BADGES, FREE_BADGES, PRO_BADGES, TOTAL_BADGES, CATEGORY_LABELS, computeBadgeContext, PREMIUM_BADGE_IDS } from '@/lib/badges';

const CATEGORY_KEYS = [
  'general',
  'mental_math',
  'percentages_growth',
  'business_math',
  'market_sizing',
  'gmat_quant',
  'streaks',
  'volume',
  'accuracy',
  'speed',
  'mastery',
  'difficulty',
  'time_of_day',
  'special',
  'fun',
];

export default function Badges() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const u = await base44.auth.me();
        const s = u?.id
          ? await getSessionsForUser(u.id, '-date', 500)
          : [];
        setUser(u);
        setSessions(s);
      } catch (e) {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPremium = user?.is_premium === true;
  const ctx = computeBadgeContext(sessions, user?.streak_count || 0);

  const totalFreeUnlocked = FREE_BADGES.filter(b => b.check(ctx)).length;
  const totalPremiumUnlocked = isPremium ? PRO_BADGES.filter(b => b.check(ctx)).length : 0;
  const totalEarned = totalFreeUnlocked + totalPremiumUnlocked;
  const displayTotal = isPremium ? TOTAL_BADGES : FREE_BADGES.length;
  const displayEarned = isPremium ? totalEarned : totalFreeUnlocked;

  const nextBadge = BADGES.find(b => !b.check(ctx) && (!PREMIUM_BADGE_IDS.has(b.id) || isPremium));

  return (
    <div className="min-h-screen bg-background px-5 lg:px-0 pt-10 pb-6 lg:max-w-3xl lg:mx-auto lg:w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-grotesk font-bold text-foreground mb-1">Achievements</h2>
        <p className="text-sm text-muted-foreground mb-2">Performance milestones across all categories</p>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-muted-foreground">{ctx.totalDrills} drills completed</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span className="text-xs text-neon-cyan font-medium">
            {displayEarned} / {displayTotal} badges unlocked 🏅
          </span>
        </div>
      </motion.div>

      {/* Next achievement */}
      {nextBadge && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
          className="bg-surface-2 border border-border rounded-2xl px-4 py-4 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Next Achievement</p>
          <p className="text-sm font-grotesk font-bold text-foreground mb-1">{nextBadge.emoji} {nextBadge.label}</p>
          <p className="text-xs text-muted-foreground">{nextBadge.description}</p>
        </motion.div>
      )}

      {/* Pro upsell banner for free users */}
      {!isPremium && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <button
            onClick={() => navigate('/paywall')}
            className="w-full bg-primary/8 border border-primary/25 rounded-2xl px-4 py-4 flex items-center justify-between mb-6 no-select hover:bg-primary/12 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Lock size={15} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">200 badges across 6 performance categories</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upgrade to Pro to unlock the full achievement system</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary shrink-0 ml-2">Unlock →</span>
          </button>
        </motion.div>
      )}

      {/* Unified badge grid by category */}
      {CATEGORY_KEYS.map((cat, ci) => {
        const catBadges = BADGES.filter(b => b.category === cat);
        if (!catBadges.length) return null;

        // For free users: free badges sorted earned-first, then pro badges always blurred at end
        const freeCatBadges = catBadges.filter(b => !PREMIUM_BADGE_IDS.has(b.id));
        const proCatBadges  = catBadges.filter(b => PREMIUM_BADGE_IDS.has(b.id));

        const earnedFree   = freeCatBadges.filter(b => b.check(ctx));
        const lockedFree   = freeCatBadges.filter(b => !b.check(ctx));
        const earnedPro    = isPremium ? proCatBadges.filter(b => b.check(ctx)) : [];
        const lockedPro    = isPremium ? proCatBadges.filter(b => !b.check(ctx)) : proCatBadges;

        const sortedBadges = isPremium
          ? [...earnedPro, ...lockedPro, ...earnedFree, ...lockedFree]
          : [...earnedFree, ...lockedFree, ...lockedPro];

        if (!sortedBadges.length) return null;

        const earnedCount = isPremium
          ? catBadges.filter(b => b.check(ctx)).length
          : earnedFree.length;
        const totalCatCount = isPremium ? catBadges.length : freeCatBadges.length;

        return (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + ci * 0.06 }}
            className="mb-6"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              {CATEGORY_LABELS[cat] || cat} ({earnedCount}/{totalCatCount})
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {sortedBadges.map((badge) => {
                const isPro = PREMIUM_BADGE_IDS.has(badge.id);
                const isBlurred = !isPremium && isPro;
                const isEarned = !isBlurred && badge.check(ctx);

                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all select-none ${
                      isBlurred
                        ? 'bg-surface-1 border-border opacity-40 blur-[2px] pointer-events-none'
                        : isEarned
                          ? `${badge.bg} ${badge.border}`
                          : 'bg-surface-1 border-border opacity-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                      isEarned ? badge.bg : 'bg-surface-3'
                    }`}>
                      {isEarned ? badge.emoji : <Lock size={18} className="text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-grotesk font-bold ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {badge.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                    </div>
                    {isEarned && <CheckCircle2 size={16} className={`${badge.color} shrink-0`} />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}