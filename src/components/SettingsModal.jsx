import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, LogOut, AlertTriangle, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { queryClientInstance } from '@/lib/query-client';
import CancellationRetentionFlow from './CancellationRetentionFlow';
import ReminderSettings from './ReminderSettings';

function clearUserCache() {
  queryClientInstance.clear();
  sessionStorage.removeItem('qd_splash_shown');
}

export default function SettingsModal({ open, onClose, user, isPremium }) {
  const [view, setView] = useState('main'); // 'main' | 'delete' | 'reminders'
  const [deleting, setDeleting] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);

  // Always reset to main view when modal closes
  useEffect(() => {
    if (!open) {
      setView('main');
      setDeleting(false);
    }
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const handleLogout = () => {
    clearUserCache();
    base44.auth.logout('/');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const u = user || await base44.auth.me();
      if (u?.id) {
        // Delete all Session records owned by this user (user-scoped, user owns these)
        const userSessions = await base44.entities.Session.filter({ user_id: u.id });
        await Promise.all(userSessions.map(s => base44.entities.Session.delete(s.id)));
        // Delete the user record (user-scoped self-delete)
        await base44.entities.User.delete(u.id);
      }
      clearUserCache();
      base44.auth.logout('/');
    } catch (e) {
      console.error('[DeleteAccount] failed:', e);
      setDeleting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]"
          onClick={handleClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] mx-5"
          >
            <div className="bg-surface-1 border border-border rounded-3xl p-6 max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-grotesk font-bold text-foreground">
                  {view === 'reminders' ? 'Daily Reminder' : 'Settings'}
                </h2>
                <button onClick={handleClose} className="w-8 h-8 bg-surface-2 rounded-xl flex items-center justify-center no-select">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Main view */}
              {view === 'main' && (
                <div className="space-y-2">
                  {/* Subscription management (premium only) */}
                  {isPremium && (
                    <button
                      onClick={() => setShowCancellation(true)}
                      className="w-full flex items-center gap-3 px-4 py-4 bg-surface-2 border border-border rounded-2xl text-left no-select hover:border-primary/50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-surface-3 flex items-center justify-center">
                        <span className="text-lg">⭐</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-foreground">Manage Subscription</span>
                        <p className="text-xs text-muted-foreground">Update billing & plan</p>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </button>
                  )}

                  {/* Upgrade (free users) */}
                  {!isPremium && (
                    <button
                      onClick={() => { handleClose(); window.location.href = '/paywall'; }}
                      className="w-full flex items-center gap-3 px-4 py-4 bg-primary/10 border border-primary/20 rounded-2xl text-left no-select hover:bg-primary/15 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                        <span className="text-lg">⭐</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-primary">Upgrade to Pro</span>
                        <p className="text-xs text-muted-foreground">Unlimited drills & more</p>
                      </div>
                      <ChevronRight size={16} className="text-primary" />
                    </button>
                  )}

                  {/* Reminders */}
                  <button
                    onClick={() => setView('reminders')}
                    className="w-full flex items-center gap-3 px-4 py-4 bg-surface-2 border border-border rounded-2xl text-left no-select hover:border-primary/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-3 flex items-center justify-center">
                      <span className="text-lg">🔔</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">Daily Reminder</span>
                      <p className="text-xs text-muted-foreground">Never miss a drill</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>

                  {/* Privacy */}
                  <button
                    onClick={() => { handleClose(); window.location.href = '/privacy'; }}
                    className="w-full flex items-center gap-3 px-4 py-4 bg-surface-2 border border-border rounded-2xl text-left no-select hover:border-primary/50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-3 flex items-center justify-center">
                      <span className="text-lg">🔒</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">Privacy Policy</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-4 bg-surface-2 border border-border rounded-2xl text-left no-select hover:border-border/60 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-3 flex items-center justify-center">
                      <LogOut size={16} className="text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground flex-1">Log Out</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>

                  {/* Delete account */}
                  <button
                    onClick={() => setView('delete')}
                    className="w-full flex items-center gap-3 px-4 py-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-left no-select hover:bg-red-500/10 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <Trash2 size={16} className="text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-red-400 flex-1">Delete Account</span>
                    <ChevronRight size={16} className="text-red-400/60" />
                  </button>
                </div>
              )}

              {/* Reminders view */}
              {view === 'reminders' && (
                <div>
                  <button
                    onClick={() => setView('main')}
                    className="text-xs text-muted-foreground hover:text-foreground mb-4 no-select transition-colors"
                  >
                    ← Back
                  </button>
                  <ReminderSettings />
                </div>
              )}

              {/* Delete confirm view */}
              {view === 'delete' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">Delete your account?</p>
                      <p className="text-xs text-muted-foreground">This will permanently erase your streak, scores, and all progress. This cannot be undone.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="w-full bg-red-500 text-white font-grotesk font-bold py-4 rounded-2xl no-select active:scale-95 transition-all disabled:opacity-60"
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                  <button
                    onClick={() => setView('main')}
                    className="w-full bg-surface-2 border border-border text-foreground font-semibold py-4 rounded-2xl no-select active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancellation flow */}
      <CancellationRetentionFlow
        open={showCancellation}
        onClose={() => setShowCancellation(false)}
        user={user}
        streakCount={user?.streak_count || 0}
        badgesCount={0}
      />
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}