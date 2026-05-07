import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefreshIndicator({ pullDistance, isRefreshing, threshold = 72 }) {
  const triggered = pullDistance >= threshold || isRefreshing;
  const opacity = Math.min(1, pullDistance / threshold);
  const rotation = (pullDistance / threshold) * 180;

  if (!isRefreshing && pullDistance === 0) return null;

  return (
    <motion.div
      style={{ height: isRefreshing ? 52 : pullDistance }}
      className="flex items-center justify-center overflow-hidden"
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.div
        style={{ opacity, rotate: isRefreshing ? undefined : rotation }}
        animate={isRefreshing ? { rotate: 360 } : {}}
        transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : {}}
      >
        <RefreshCw
          size={20}
          className={triggered ? 'text-primary' : 'text-muted-foreground'}
        />
      </motion.div>
    </motion.div>
  );
}