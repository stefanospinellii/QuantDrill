import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, LogOut, AlertTriangle, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { queryClientInstance } from '@/lib/query-client';

function clearUserCache() {
  queryClientInstance.clear();
  sessionStorage.removeItem('qd_splash_shown');
}

export default function SettingsModal({ open, onClose }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    clearUserCache();
    base44.auth.logout('/');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Get current user to get their ID
      const user = await base44.auth.me();
      if (user?.id) {
        // Delete the user account via service role
        await base44.asServiceRole.entities.User.delete(user.id);
      }
      clearUserCache();
      base44.auth.logout('/');
    } catch (e) {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[9999] no-select"
          />

          {/* Centered Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-x-5 z-[9999] mx-auto max-w-sm lg:max-w-md"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="bg-surface-1 border border-border rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-grotesk font-bold text-foreground">Settings</h2>
                <button onClick={onClose} className="w-8 h-8 bg-surface-2 rounded-xl flex items-center justify-center no-select">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-grotesk font-bold text-foreground">Settings</h2>
                <button onClick={onClose} className="w-8 h-8 bg-surface-2 rounded-xl flex items-center justify-center no-select">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {!showDeleteConfirm ? (
                <div className="space-y-2">
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
            </div>
            </motion.div>
            </>
            )}
            </AnimatePresence>
            );
            }