'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { supabase, getCurrentUser } from '@/lib/supabase';

const getNavItems = (isAdmin: boolean) => {
  const baseItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/production', label: 'Production' },
    { href: '/storage', label: 'Storage' },
    { href: '/transportation', label: 'Transportation' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/renewable-sources', label: 'Renewable Sources' },
    { href: '/research', label: 'Research' },
    { href: '/simulation', label: 'Simulation' },
  ];
  
  if (isAdmin) {
    baseItems.push({ href: '/admin', label: '🔒 Admin Panel' });
  }
  
  return baseItems;
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; full_name?: string; role?: string; organization?: string; admin_status?: string } | null>(null);
  
  // Check if user is active admin
  const isAdmin = user?.role === 'admin' && user?.admin_status === 'active';
  const navItems = useMemo(() => getNavItems(isAdmin), [isAdmin]);

  useEffect(() => {
    const run = async () => {
      const { user: currentUser } = await getCurrentUser();
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, role, organization, admin_status')
          .eq('id', currentUser.id)
          .single();
        setUser({ 
          email: profile?.email || currentUser.email || undefined, 
          full_name: profile?.full_name || undefined,
          role: profile?.role || undefined,
          organization: profile?.organization || undefined,
          admin_status: profile?.admin_status || undefined
        });
      } else {
        setUser(null);
      }
    };
    run();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser({ email: session.user.email || undefined });
      } else setUser(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const active = useMemo(() => pathname, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed z-40 inset-y-0 left-0 w-64 bg-white/95 backdrop-blur-md border-r border-gray-200 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link href="/dashboard" className="text-lg font-bold gradient-text">🌿 Green Hydrogen</Link>
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors ${pathname === item.href ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <div className="flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b">
          <div className="h-16 px-3 sm:px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="lg:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <span className="hidden sm:inline text-sm text-gray-600 truncate">{navItems.find(n => pathname === n.href)?.label || 'Overview'}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              {user ? (
                <div className="flex items-center gap-1 sm:gap-3">
                  <Link href="/profile" className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 sm:p-2 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                      {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-24">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.role || 'Operator'}</p>
                    </div>
                  </Link>
                  <button onClick={handleSignOut} className="text-xs text-red-600 hover:underline flex items-center gap-1 p-1">
                    <LogOut className="w-3 h-3" /> 
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 px-2 sm:px-3 py-1.5 rounded-md">Login</Link>
              )}
            </div>
          </div>
        </header>

        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
