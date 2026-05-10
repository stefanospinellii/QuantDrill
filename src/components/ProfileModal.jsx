import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getSessionsForUser } from '@/lib/querySafety';

function getInitials(name, email) {
  if (name && name.trim()) return name.trim().slice(0, 2).toUpperCase();
  return email?.split('@')[0]?.slice(0, 2).toUpperCase() || '?';
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProfileModal({ open, onClose, user, isPremium, onUserUpdate }) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Reset edit state when modal closes
  useEffect(() => {
    if (!open) {
      setEditingName(false);
      setNameValue('');
      setSavingName(false);
    }
  }, [open]);

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      await base44.auth.updateMe({ full_name: trimmed });
      // Update parent state immediately — no page refresh
      if (onUserUpdate) onUserUpdate({ ...user, full_name: trimmed });
      setEditingName(false);
    } catch (e) {
      // fail silently, keep editing open
    } finally {
      setSavingName(false);
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

              {/* Profile section */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-grotesk font-bold text-primary-foreground">
                    {getInitials(user?.full_name, user?.email)}
                  </span>
                </div>

                {editingName ? (
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <input
                      autoFocus
                      value={nameValue}
                      onChange={e => setNameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setEditingName(false);
                      }}
                      className="bg-surface-2 border border-primary rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground text-center focus:outline-none w-40"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="text-xs font-bold text-primary no-select"
                    >
                      {savingName ? '...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="text-xs text-muted-foreground no-select"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setNameValue(user?.full_name || ''); setEditingName(true); }}
                    className="text-lg font-grotesk font-bold text-foreground mb-1 hover:text-primary transition-colors no-select group flex items-center gap-1.5 mx-auto"
                  >
                    {user?.full_name || 'User'}
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
                  </button>
                )}

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

              {/* Upgrade CTA for free users */}
              {!isPremium && (
                <button
                  onClick={() => { onClose(); window.location.href = '/paywall'; }}
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}