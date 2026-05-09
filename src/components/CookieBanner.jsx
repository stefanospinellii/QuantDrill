import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'qd_cookie_consent';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show for unauthenticated users
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShow(false);
    // Load analytics here if needed
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShow(false);
    // Do not load analytics
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-safe"
          style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}
        >
          <div className="max-w-md mx-auto bg-surface-1 border border-border rounded-2xl p-5 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground no-select"
            >
              <X size={14} />
            </button>

            {/* Content */}
            <p className="text-sm text-foreground mb-4 pr-6">
              We use cookies to improve your experience and analyze how you use QuantDrill.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2.5 bg-surface-2 border border-border text-foreground text-sm font-medium rounded-lg no-select hover:border-primary/50 transition-colors active:scale-95"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg no-select active:scale-95 transition-transform"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}