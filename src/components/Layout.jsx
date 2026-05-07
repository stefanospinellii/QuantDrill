import { useRef, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart2, Award } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/progress', icon: BarChart2, label: 'Progress' },
  { path: '/badges', icon: Award, label: 'Badges' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDrill = location.pathname === '/drill';

  // Store scroll positions per tab path
  const scrollPositions = useRef({});
  // Ref to the scrollable main container
  const mainRef = useRef(null);

  const handleNavClick = useCallback((path) => {
    const isActive = location.pathname === path;

    if (isActive) {
      // Already on this tab — scroll to top
      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Save current scroll position before leaving
    if (mainRef.current) {
      scrollPositions.current[location.pathname] = mainRef.current.scrollTop;
    }

    navigate(path);

    // Restore scroll position after navigation settles
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (mainRef.current) {
          mainRef.current.scrollTop = scrollPositions.current[path] ?? 0;
        }
      });
    });
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <main
        ref={mainRef}
        className={`flex-1 overflow-y-auto ${isDrill ? '' : 'pb-20'}`}
        style={{ paddingBottom: isDrill ? undefined : 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      {!isDrill && (
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-surface-1 border-t border-border z-50 no-select"
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
  );
}