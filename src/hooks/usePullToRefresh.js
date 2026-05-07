import { useState, useRef, useCallback } from 'react';

/**
 * usePullToRefresh — returns { pullDistance, isRefreshing, handlers }
 * Attach handlers.onTouchStart/Move/End to the scroll container.
 * Call `onRefresh` (async fn) to trigger the refetch.
 */
export function usePullToRefresh(onRefresh, threshold = 72) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const onTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (el && el.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null || isRefreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      e.preventDefault();
      // Dampen pull with sqrt for rubber-band feel
      setPullDistance(Math.min(threshold * 1.5, Math.sqrt(delta) * 5));
    }
  }, [isRefreshing, threshold]);

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(0);
      try { await onRefresh(); } finally { setIsRefreshing(false); }
    } else {
      setPullDistance(0);
    }
    startY.current = null;
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}