import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'qd_splash_shown';

export default function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(SESSION_KEY));

  useEffect(() => {
    if (!visible) {
      onDone();
      return;
    }
    sessionStorage.setItem(SESSION_KEY, '1');
    // fade in 0.4s, hold 1.2s, fade out 0.4s
    const timer = setTimeout(() => {
      setVisible(false);
    }, 400 + 1200); // start fade-out after hold

    return () => clearTimeout(timer);
  }, []);

  if (!visible && sessionStorage.getItem(SESSION_KEY)) {
    // Already shown this session — skip entirely
    return null;
  }

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
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          <img
            src="https://media.base44.com/images/public/69fcb12caee6ab9a4c226c8f/aa9e7382c_Untitleddesign1.png"
            alt="QuantDrill"
            style={{ width: 160, height: 'auto' }}
            draggable={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}