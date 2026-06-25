import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, PlusCircle, Sparkles, Trophy, Settings,
  ShieldCheck, Zap, BookOpen, Menu, X, LogOut,
  Heart, Image, Quote, FileText, Star, Search, PenLine, ArrowLeftRight, Target
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SubscriptionGuard from '@/components/SubscriptionGuard';

const ADMIN_EMAIL = 'perkupdaily@gmail.com'; // Only show Admin nav for this account

const mainNav = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/add-entry', icon: PlusCircle, label: 'Add Entry' },
  { path: '/vault', icon: Sparkles, label: 'Perk Ups' },
  { path: '/search', icon: Search, label: 'Search' },
];

const libraryNav = [
  { path: '/reflections', icon: PenLine, label: 'Reflections' },
  { path: '/micro-stories', icon: Image, label: 'Micro-Stories' },
  { path: '/blessings', icon: Heart, label: 'Blessings' },
  { path: '/milestones', icon: Trophy, label: 'Life Wins' },
  { path: '/affirmations', icon: Zap, label: 'Affirmations' },
  { path: '/quotes', icon: Quote, label: 'Quotes' },
  { path: '/identity-upgrades', icon: ArrowLeftRight, label: 'Identity Upgrades' },
  { path: '/vision-goals', icon: Target, label: 'Vision & Goals' },
];

const scriptureNav = { path: '/scriptures', icon: BookOpen, label: 'Scriptures' };

const sideTabNav = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/vault', icon: Sparkles, label: 'Perk Ups' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

function NavLink({ path, icon: Icon, label, onClick }) {
  const location = useLocation();
  const active = location.pathname === path;
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
      }`}
      style={active ? {} : { color: '#2F2C29' }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}

function SidebarContent({ user, onNavClick }) {
  const isAdmin = user?.email === ADMIN_EMAIL;
  const christianEnabled = user?.christian_content;

  return (
    <div className="flex flex-col min-h-full">
      <Link to="/dashboard" onClick={onNavClick} className="mb-10 flex items-center gap-3">
        <img src="https://media.base44.com/images/public/6a312911bcddb0806c388af8/ad5333c2c_PerkUpKingfisher.png" alt="Perk Up Daily" className="w-8 h-8 object-contain shrink-0" />
        <div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', lineHeight: 1.1 }} className="text-foreground">Perk Up Daily</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your daily dose of good</p>
        </div>
      </Link>

      <div className="space-y-1 flex-1 overflow-y-auto">
        {mainNav.map(item => (
          <NavLink key={item.path} {...item} onClick={onNavClick} />
        ))}

        <div className="pt-4 mt-4 border-t border-border space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-2">Library</p>
          {libraryNav.map(item => (
            <NavLink key={item.path} {...item} onClick={onNavClick} />
          ))}
          {christianEnabled && (
            <NavLink {...scriptureNav} onClick={onNavClick} />
          )}
        </div>

        <div className="pt-4 mt-4 border-t border-border space-y-1">
          <NavLink path="/settings" icon={Settings} label="Settings" onClick={onNavClick} />
          {isAdmin && (
            <NavLink path="/admin" icon={ShieldCheck} label="Admin" onClick={onNavClick} />
          )}
          <button
            onClick={() => base44.auth.logout('/')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left hover:bg-accent"
            style={{ color: '#2F2C29' }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollPositionsRef = useState({})[0];

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Save scroll position before navigating away
  useEffect(() => {
    const handleScroll = () => {
      const mainElement = document.querySelector('main');
      if (mainElement) {
        scrollPositionsRef[location.pathname] = mainElement.scrollTop;
      }
    };
    const mainElement = document.querySelector('main');
    mainElement?.addEventListener('scroll', handleScroll);
    return () => mainElement?.removeEventListener('scroll', handleScroll);
  }, [location.pathname, scrollPositionsRef]);

  // Restore scroll position on route change
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      const savedPosition = scrollPositionsRef[location.pathname];
      mainElement.scrollTop = savedPosition || 0;
    }
  }, [location.pathname, scrollPositionsRef]);

  return (
    <div className="min-h-screen bg-background">

      {/* Mobile/Tablet top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border/60" style={{ paddingTop: 'env(safe-area-inset-top)', background: 'linear-gradient(135deg, rgba(212,131,10,0.12) 0%, rgba(253,248,240,0.82) 60%)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/6a312911bcddb0806c388af8/ad5333c2c_PerkUpKingfisher.png" alt="Perk Up Daily" className="w-7 h-7 object-contain" />
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', lineHeight: 1.1 }} className="text-foreground">Perk Up Daily</span>
          </Link>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile slide-down menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed top-[53px] left-0 right-0 bottom-0 z-40 flex flex-col"
          style={{ background: 'linear-gradient(160deg, rgba(212,131,10,0.10) 0%, rgba(253,248,240,0.88) 50%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="flex-1 overflow-y-auto p-5 pb-24">
            <SidebarContent user={user} onNavClick={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col p-6 z-40 border-r border-border/60" style={{ background: 'linear-gradient(160deg, rgba(212,131,10,0.10) 0%, rgba(253,248,240,0.85) 55%)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
        <SidebarContent user={user} onNavClick={null} />
      </nav>

      {/* Mobile bottom tab bar with raised center Add button */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/60 z-50" style={{ background: 'linear-gradient(135deg, rgba(212,131,10,0.10) 0%, rgba(253,248,240,0.85) 60%)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
        <div className="flex items-center justify-around py-2 px-2 pb-[env(safe-area-inset-bottom,8px)] relative">
          {/* Left tabs */}
          {sideTabNav.slice(0, 2).map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/');
            const handleTabClick = (e) => {
              if (active) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
            };
            return (
              <Link
                key={path}
                to={path}
                onClick={handleTabClick}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all active:scale-95 ${active ? 'text-primary' : 'hover:text-foreground'}`}
                style={active ? {} : { color: '#2F2C29' }}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}

          {/* Center spacer for raised button */}
          <div className="w-16 flex justify-center">
          <Link
              to="/add-entry"
              className="flex flex-col items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #E8A838 0%, #d4830a 100%)',
                width: 56,
                height: 56,
                position: 'relative',
                top: -18,
                border: '1px solid #fef9f2',
              }}
              aria-label="Add Entry"
            >
              <PlusCircle className="w-7 h-7" style={{ color: '#fef9f2' }} strokeWidth={2} />
            </Link>  
          </div>

          {/* Right tabs */}
          {sideTabNav.slice(2).map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/');
            const handleTabClick = (e) => {
              if (active) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
            };
            return (
              <Link
                key={path}
                to={path}
                onClick={handleTabClick}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all active:scale-95 ${active ? 'text-primary' : 'hover:text-foreground'}`}
                style={active ? {} : { color: '#2F2C29' }}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content with slide transitions */}
      <main className="md:ml-64 pt-[53px] md:pt-0 pb-24 md:pb-6 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <SubscriptionGuard>
              <Outlet />
            </SubscriptionGuard>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}