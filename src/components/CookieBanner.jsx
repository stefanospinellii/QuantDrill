import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Circle } from 'lucide-react';
import { getConsentState, saveConsentState, acceptAll, rejectAll } from '@/lib/consentManager';

const CATEGORIES = [
  {
    key: 'essential',
    label: 'Essential',
    description: 'Required for login, security, and core app functionality',
    locked: true,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Helps us understand how the app is used to improve it',
    locked: false,
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Used for personalized content and ads. Not currently active.',
    locked: false,
  },
];

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });

  // Check consent state on mount - only show banner if no consent exists
  useEffect(() => {
    const existing = getConsentState();
    if (!existing) {
      // No consent saved yet, show banner
      setShowBanner(true);
    }
  }, []);

  // Expose function to open preferences from anywhere
  useEffect(() => {
    window.openCookiePreferences = () => {
      setShowModal(true);
    };
  }, []);

  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    saveConsentState(preferences);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleToggle = (key) => {
    if (key === 'essential') return; // Essential is locked
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const closeModalOnly = () => {
    setShowModal(false);
  };

  return (
    <AnimatePresence mode="wait">
      {/* Main Banner — shows only on first visit when no consent exists */}
      {showBanner && !showModal && (
        <motion.div
          key="banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-safe"
          style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}
        >
          <div className="max-w-2xl mx-auto bg-surface-1 border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex-1">
              <h3 className="text-lg font-grotesk font-bold text-foreground mb-2">We use cookies</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                We use cookies to ensure the app works correctly and, with your consent, to analyze usage and improve your experience.
              </p>

              {/* Buttons — stack on <360px, side-by-side on larger */}
              <div className="flex flex-col gap-2 mb-4 xs:flex-row xs:gap-3">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2.5 bg-surface-2 border border-border text-foreground text-sm font-semibold rounded-lg no-select hover:border-primary/50 transition-colors active:scale-95 flex-1"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2.5 bg-surface-2 border border-border text-foreground text-sm font-semibold rounded-lg no-select hover:border-primary/50 transition-colors active:scale-95 flex-1"
                >
                  Manage Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg no-select active:scale-95 transition-transform flex-1"
                >
                  Accept All
                </button>
              </div>

              {/* Privacy link */}
              <a
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Read our Privacy Policy
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Manage Preferences Modal */}
      {showModal && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModalOnly}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-x-5 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-md"
          >
            <div className="bg-surface-1 border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-grotesk font-bold text-foreground">Cookie Preferences</h2>
                <button
                  onClick={closeModalOnly}
                  className="w-7 h-7 bg-surface-2 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground no-select transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-4 mb-8">
                {CATEGORIES.map(category => (
                  <div
                    key={category.key}
                    className="bg-surface-2 border border-border rounded-xl p-4 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">{category.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{category.description}</p>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(category.key)}
                      disabled={category.locked}
                      className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors no-select ${
                        preferences[category.key]
                          ? 'bg-primary/20 text-primary'
                          : 'bg-surface-3 text-muted-foreground'
                      } ${category.locked ? 'cursor-not-allowed opacity-50' : 'hover:opacity-80'}`}
                    >
                      {preferences[category.key] ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Buttons — Save My Preferences, Reject All, Accept All */}
              <div className="flex flex-col gap-3 mb-4">
                <button
                  onClick={handleRejectAll}
                  className="w-full px-4 py-3 bg-surface-2 border border-border text-foreground text-sm font-semibold rounded-lg no-select hover:border-primary/50 transition-colors active:scale-95"
                >
                  Reject All
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="w-full px-4 py-3 bg-surface-2 border border-border text-foreground text-sm font-semibold rounded-lg no-select hover:border-primary/50 transition-colors active:scale-95"
                >
                  Save My Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg no-select active:scale-95 transition-transform"
                >
                  Accept All
                </button>
              </div>

              {/* Privacy link */}
              <a
                href="/privacy"
                className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Read our Privacy Policy
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}