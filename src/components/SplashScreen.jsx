import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'qd_splash_shown';

export default function SplashScreen({ onDone }) {
  const alreadyShown = sessionStorage.getItem(SESSION_KEY);
  const [visible, setVisible] = useState(!alreadyShown);

  useEffect(() => {
    if (alreadyShown) {
      onDone();
      return;
    }
    sessionStorage.setItem(SESSION_KEY, '1');
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ backgroundColor: '#12082A' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        >
          <span
            className="font-grotesk font-black text-2xl tracking-tight"
            style={{ color: '#7C3AED' }}
          >
            Quant<span style={{ color: '#fff' }}>Drill</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}