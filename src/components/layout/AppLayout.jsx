import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home, PlusCircle, Sparkles, Trophy, Settings,
  ShieldCheck, Zap, BookOpen, Menu, X, LogOut,
  Heart, Image, Quote, FileText, Star, Search
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ADMIN_EMAIL = 'perkupdaily@gmail.com'; // Only show Admin nav for this account

const mainNav = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/add-entry', icon: PlusCircle, label: 'Add Entry' },
  { path: '/vault', icon: Sparkles, label: 'Perk Ups' },
  { path: '/search', icon: Search, label: 'Search' },
];

const libraryNav = [
  { path: '/memories', icon: Image, label: 'Memories' },
  { path: '/blessings', icon: Heart, label: 'Blessings' },
  { path: '/milestones', icon: Trophy, label: 'Life Wins' },
  { path: '/affirmations', icon: Zap, label: 'Affirmations' },
  { path: '/quotes', icon: Quote, label: 'Quotes' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/identity-upgrades', icon: Star, label: 'Identity Upgrades' },
];

const scriptureNav = { path: '/scriptures', icon: BookOpen, label: 'Scriptures' };

const bottomTabNav = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/vault', icon: Sparkles, label: 'Perk Ups' },
  { path: '/add-entry', icon: PlusCircle, label: 'Add' },
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
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
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
    <>
      <Link to="/dashboard" onClick={onNavClick} className="mb-10 block">
        <h1 className="font-display text-xl font-semibold text-foreground">Perk Up Daily</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Your daily dose of good</p>
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Log out
          </button>
        </div>
      </div>
    </>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">

      {/* Mobile/Tablet top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <circle cx="18" cy="18" r="18" fill="oklch(0.92 0.12 70)"/>
              <circle cx="18" cy="20" r="7" fill="#d4830a"/>
              <line x1="18" y1="8" x2="18" y2="5" stroke="#d4830a" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="25.5" y1="10.5" x2="27.6" y2="8.4" stroke="#d4830a" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="10.5" y1="10.5" x2="8.4" y2="8.4" stroke="#d4830a" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="28" y1="20" x2="31" y2="20" stroke="#d4830a" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="8" y1="20" x2="5" y2="20" stroke="#d4830a" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="font-display text-base font-semibold text-foreground">Perk Up Daily</span>
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
        <div className="md:hidden fixed top-[53px] left-0 right-0 bottom-0 z-40 overflow-y-auto p-5"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)' }}>
          <SidebarContent user={user} onNavClick={() => setMenuOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col p-6 z-40">
        <SidebarContent user={user} onNavClick={null} />
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
        <div className="flex items-center justify-around py-2 px-2 pb-[env(safe-area-inset-bottom,8px)]">
          {bottomTabNav.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            const handleTabClick = (e) => {
              if (active) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            };
            return (
              <Link
                key={path}
                to={path}
                onClick={handleTabClick}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all active:scale-95 ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="md:ml-64 pt-[53px] md:pt-0 pb-24 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
}