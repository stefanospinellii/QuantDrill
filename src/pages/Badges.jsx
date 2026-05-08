import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BADGES, CATEGORY_LABELS, computeBadgeContext, PREMIUM_BADGE_IDS } from '@/lib/badges';

const CATEGORY_KEYS = ['general', 'mental_math', 'percentages_growth', 'business_math', 'market_sizing', 'gmat_quant'];

export default function Badges() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [u, s] = await Promise.all([
          base44.auth.me(),
          base44.entities.Session.list('-date', 500),
        ]);
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

  const freeBadges = BADGES.filter(b => !PREMIUM_BADGE_IDS.has(b.id));
  const totalUnlocked = freeBadges.filter(b => b.check(ctx)).length;
  const totalPremiumUnlocked = isPremium ? BADGES.filter(b => PREMIUM_BADGE_IDS.has(b.id) && b.check(ctx)).length : 0;
  const totalAll = isPremium ? BADGES.length : freeBadges.length;
  const totalEarned = totalUnlocked + totalPremiumUnlocked;

  const nextBadge = BADGES.find(b => !b.check(ctx) && (!PREMIUM_BADGE_IDS.has(b.id) || isPremium));

  return (
    <div className="min-h-screen bg-background px-5 pt-10 pb-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-grotesk font-bold text-foreground mb-1">Achievements</h2>
        <p className="text-sm text-muted-foreground mb-2">Performance milestones across all categories</p>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-muted-foreground">{ctx.totalDrills} drills completed</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span className="text-xs text-neon-cyan font-medium">
            {totalEarned}/{totalAll} unlocked
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

      {/* Premium upsell for locked badges */}
      {!isPremium && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <button
            onClick={() => navigate('/paywall')}
            className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-4 py-4 flex items-center justify-between mb-6 no-select"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock size={14} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{PREMIUM_BADGE_IDS.size} Elite Badges Locked</p>
                <p className="text-xs text-muted-foreground">Unlock with Premium to earn all achievements</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">Unlock →</span>
          </button>
        </motion.div>
      )}

      {/* Badges by category */}
      {CATEGORY_KEYS.map((cat, ci) => {
        const catBadges = BADGES.filter(b => b.category === cat);
        if (!catBadges.length) return null;

        return (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + ci * 0.06 }}
            className="mb-6"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              {CATEGORY_LABELS[cat] || cat}
            </p>
            <div className="space-y-2.5">
              {catBadges.map((badge) => {
                const unlocked = badge.check(ctx);
                const isPremiumBadge = PREMIUM_BADGE_IDS.has(badge.id);
                const isLocked = !unlocked || (isPremiumBadge && !isPremium);
                const isPremiumGated = isPremiumBadge && !isPremium;

                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl border transition-all ${
                      unlocked && !isPremiumGated
                        ? `${badge.bg} ${badge.border}`
                        : 'bg-surface-1 border-border'
                    } ${isLocked ? 'opacity-50' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                      unlocked && !isPremiumGated ? badge.bg : 'bg-surface-3'
                    }`}>
                      {isPremiumGated ? (
                        <Lock size={16} className="text-primary" />
                      ) : unlocked ? (
                        badge.emoji
                      ) : (
                        <Lock size={18} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-grotesk font-bold ${unlocked && !isPremiumGated ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {badge.label}
                        </p>
                        {isPremiumBadge && !isPremium && (
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                    </div>
                    {unlocked && !isPremiumGated && (
                      <CheckCircle2 size={16} className={`${badge.color} shrink-0`} />
                    )}
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