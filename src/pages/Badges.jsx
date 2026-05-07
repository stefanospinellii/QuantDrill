import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { getAllBadges, computeStats } from '@/lib/badges';

export default function Badges() {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.Session.list('-created_date', 100),
    ]).then(([u, s]) => {
      setUser(u);
      setSessions(s);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = computeStats(user, sessions);
  const badges = getAllBadges();
  const unlocked = badges.filter(b => b.check(stats));
  const locked = badges.filter(b => !b.check(stats));

  return (
    <div
      className="min-h-screen bg-background px-5 pb-8 flex flex-col gap-6"
      style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))' }}
    >
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-grotesk font-bold text-foreground tracking-tight">Badges</h1>
        <p className="text-xs text-muted-foreground mt-1">{unlocked.length} / {badges.length} unlocked</p>
      </motion.div>

      {unlocked.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Unlocked</p>
          <div className="grid grid-cols-2 gap-3">
            {unlocked.map(badge => (
              <BadgeCard key={badge.id} badge={badge} unlocked />
            ))}
          </div>
        </motion.div>
      )}

      {locked.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Locked</p>
          <div className="grid grid-cols-2 gap-3">
            {locked.map(badge => (
              <BadgeCard key={badge.id} badge={badge} unlocked={false} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function BadgeCard({ badge, unlocked }) {
  return (
    <div className={`rounded-2xl p-4 border flex flex-col gap-2 transition-all ${
      unlocked ? 'bg-primary/5 border-primary/30' : 'bg-surface-2 border-border opacity-50'
    }`}>
      <span className="text-2xl">{badge.emoji}</span>
      <div>
        <p className={`text-sm font-semibold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{badge.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
      </div>
    </div>
  );
}