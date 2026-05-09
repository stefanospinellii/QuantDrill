import { useRef, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart2, Award, Zap } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/progress', icon: BarChart2, label: 'Progress' },
  { path: '/badges', icon: Award, label: 'Badges' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDrill = location.pathname === '/drill';

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

        {/* Upgrade CTA at bottom of sidebar (shown via page, but placeholder here) */}
        <div className="px-3 pb-6 pt-2 border-t border-border">
          <button
            onClick={() => navigate('/paywall')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all no-select"
          >
            <Zap size={16} className="text-primary" />
            Upgrade to Pro
          </button>
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
      </div>
    </div>
  );
}