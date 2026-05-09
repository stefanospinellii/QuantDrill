import { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { queryClientInstance } from '@/lib/query-client';

function clearUserCache() {
  queryClientInstance.clear();
  sessionStorage.removeItem('qd_splash_shown');
}

function getInitials(email) {
  return email?.split('@')[0]?.slice(0, 2).toUpperCase() || '?';
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProfileModal({ open, onClose, user, isPremium }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    clearUserCache();
    base44.auth.logout('/');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      if (user?.id) {
        await base44.asServiceRole.entities.User.delete(user.id);
      }
      clearUserCache();
      base44.auth.logout('/');
    } catch (e) {
      setDeleting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]"
          onClick={onClose}
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
            <div className="relative bg-surface-1 border border-border rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-7 h-7 bg-surface-3 rounded-full flex items-center justify-center no-select"
              >
                <X size={13} className="text-muted-foreground" />
              </button>

              {!showDeleteConfirm ? (
                <>
                  {/* Profile section */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-grotesk font-bold text-primary-foreground">
                        {getInitials(user?.email)}
                      </span>
                    </div>
                    <h2 className="text-lg font-grotesk font-bold text-foreground mb-1">
                      {user?.full_name || 'User'}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>

                    {/* Subscription badge */}
                    <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold mb-4 ${
                      isPremium
                        ? 'bg-primary/10 text-primary'
                        : 'bg-surface-2 border border-border text-muted-foreground'
                    }`}>
                      {isPremium ? '⭐ Pro Member' : 'Free'}
                    </div>

                    {/* Member since */}
                    <p className="text-xs text-muted-foreground">
                      Member since {formatDate(user?.created_date)}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    {!isPremium && (
                      <button
                        onClick={() => {
                          onClose();
                          window.location.href = '/paywall';
                        }}
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

                    {isPremium && (
                      <button
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
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center gap-3 px-4 py-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-left no-select hover:bg-red-500/10 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <Trash2 size={16} className="text-red-400" />
                      </div>
                      <span className="text-sm font-medium text-red-400 flex-1">Delete Account</span>
                      <ChevronRight size={16} className="text-red-400/60" />
                    </button>
                  </div>
                </>
              ) : (
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
                    onClick={() => setShowDeleteConfirm(false)}
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
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}