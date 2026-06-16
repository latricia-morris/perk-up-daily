import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Archive, Trophy, Settings, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NAV_ITEMS = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/add-entry', icon: PlusCircle, label: 'Add' },
  { path: '/vault', icon: Archive, label: 'Vault' },
  { path: '/milestones', icon: Trophy, label: 'Life Wins' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const isAdmin = user?.role === 'admin';
  const christianEnabled = user?.christian_content;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around py-2 px-2 pb-[env(safe-area-inset-bottom,8px)]">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
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

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex-col p-6 z-40">
        <Link to="/dashboard" className="mb-10">
          <h1 className="font-display text-xl font-semibold text-foreground">Perk Up Daily</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your daily dose of good</p>
        </Link>

        <div className="space-y-1 flex-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-border space-y-1">
            <Link
              to="/milestones"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/milestones' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              Life Wins
            </Link>
            <Link
              to="/affirmations"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/affirmations' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              Affirmations
            </Link>
            {christianEnabled && (
              <Link
                to="/scriptures"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/scriptures' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Scriptures
              </Link>
            )}
          </div>

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-border">
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/admin' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="pb-24 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
}