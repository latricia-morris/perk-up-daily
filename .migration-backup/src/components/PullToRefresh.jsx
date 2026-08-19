import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const scrollRef = useRef(null);

  const PULL_THRESHOLD = 100;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (el.scrollTop !== 0) return;
      const distance = e.touches[0].clientY - startYRef.current;
      if (distance > 0) {
        setPullDistance(distance);
        setIsPulling(distance > PULL_THRESHOLD);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance > PULL_THRESHOLD) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        if (onRefresh) {
          await onRefresh();
        }
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, onRefresh]);

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto flex flex-col relative"
      style={{ height: '100%' }}
    >
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 pointer-events-none"
          style={{ y: -64 + Math.min(pullDistance, PULL_THRESHOLD) }}
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : isPulling ? 180 : 0 }}
            transition={{ duration: isRefreshing ? 1 : 0.3, repeat: isRefreshing ? Infinity : 0 }}
          >
            <RefreshCw className="w-5 h-5 text-primary" />
          </motion.div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div animate={{ y: Math.min(pullDistance, PULL_THRESHOLD * 0.5) }}>
        {children}
      </motion.div>
    </div>
  );
}