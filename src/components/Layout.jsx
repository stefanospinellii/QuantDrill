import { useRef, useCallback, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart2, Award, Zap, Settings, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import PageTransition from './PageTransition';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';
import { getDrillAccess } from '@/lib/freemium';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/progress', icon: BarChart2, label: 'Progress' },
  { path: '/badges', icon: Award, label: 'Badges' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDrill = location.pathname === '/drill';

  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const s = await base44.entities.Session.filter({ created_by: u.email }, '-created_date', 20);
        setSessions(s);
      } catch (e) {}
    }
    load();
  }, []);

  const { isPremium } = getDrillAccess(sessions, user);

  const scrollPositions = useRef({});
  const mainRef = useRef(null);

  const handleNavClick = useCallback((path) => {
    const isActive = location.pathname === path;
    if (isActive) {
      if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (mainRef.current) scrollPositions.current[location.pathname] = mainRef.current.scrollTop;
    navigate(path);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (mainRef.current) mainRef.current.scrollTop = scrollPositions.current[path] ?? 0;
      });
    });
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Desktop Sidebar (lg+) ── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-60 bg-[#0F1520] border-r border-border z-40 shrink-0">
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-border">
          <span className="text-xl font-grotesk font-black text-foreground tracking-tight">
            Quant<span className="text-primary">Drill</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => handleNavClick(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all no-select ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Profile & Settings at bottom */}
        <div className="px-3 pb-6 pt-2 border-t border-border space-y-2">
          {/* Profile button */}
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm hover:bg-white/5 transition-all no-select group"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
              {user?.full_name ? user.full_name.trim().slice(0, 2).toUpperCase() : (user?.email?.slice(0, 2).toUpperCase() || '?')}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground truncate">
                {user?.email?.split('@')[0] || 'Profile'}
              </p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground shrink-0" />
          </button>

          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all no-select"
          >
            <Settings size={16} />
            Settings
          </button>

          {/* Upgrade to Pro (free users only) */}
          {!isPremium && (
            <button
              onClick={() => navigate('/paywall')}
              className="w-full mt-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-grotesk font-bold text-xs px-3 py-3 rounded-xl no-select active:scale-95 transition-transform"
            >
              Unlock Pro
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
        <main
          ref={mainRef}
          className={`flex-1 overflow-y-auto ${!isDrill ? 'pb-20 lg:pb-0' : ''}`}
          style={!isDrill ? { paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' } : undefined}
        >
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>

        {/* ── Mobile bottom nav (below lg) ── */}
        {!isDrill && (
          <nav
            className="fixed bottom-0 left-0 right-0 lg:hidden bg-surface-1 border-t border-border z-50 no-select"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="flex items-center justify-around px-2 py-3">
              {navItems.map(({ path, icon: Icon, label }) => {
                const active = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => handleNavClick(path)}
                    className={`flex flex-col items-center gap-1 px-5 py-1 rounded-xl transition-all duration-200 no-select ${
                      active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                    <span className={`text-[10px] font-medium tracking-wide ${active ? 'text-primary' : ''}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* ── Desktop cookie preferences link ── */}
        <button
          onClick={() => window.openCookiePreferences?.()}
          className="hidden lg:block fixed bottom-6 left-6 text-xs text-muted-foreground hover:text-foreground transition-colors no-select"
        >
          Cookie Preferences
        </button>
      </div>

      {/* ── Modals ── */}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        isPremium={isPremium}
        onUserUpdate={(updated) => setUser(updated)}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        isPremium={isPremium}
      />
    </div>
  );
}