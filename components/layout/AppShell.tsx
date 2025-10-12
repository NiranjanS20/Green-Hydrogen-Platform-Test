'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { supabase, getCurrentUser } from '@/lib/supabase';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/production', label: 'Production' },
  { href: '/storage', label: 'Storage' },
  { href: '/transportation', label: 'Transportation' },
  { href: '/research', label: 'Research' },
  { href: '/simulation', label: 'Simulation' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);

  useEffect(() => {
    const run = async () => {
      const { user: currentUser } = await getCurrentUser();
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', currentUser.id)
          .single();
        setUser({ email: profile?.email || currentUser.email || undefined, full_name: profile?.full_name || undefined });
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
      <aside className={`fixed z-40 inset-y-0 left-0 w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 transform transition-transform duration-200 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link href="/dashboard" className="text-lg font-bold gradient-text">🌿 Green Hydrogen</Link>
          <button className="md:hidden p-2" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-50 hover:text-blue-700 ${active?.startsWith(item.href) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <div className="flex-1 md:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="md:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <span className="hidden md:inline text-sm text-gray-600">{navItems.find(n => active?.startsWith(n.href))?.label || 'Overview'}</span>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {user ? (
                <div className="flex items-center gap-2 pl-3 border-l">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700 max-w-[160px] truncate">{user.full_name || user.email}</span>
                  <button onClick={handleSignOut} className="text-xs text-red-600 hover:underline flex items-center gap-1">
                    <LogOut className="w-3 h-3" /> Sign out
                  </button>
                </div>
              ) : (
                <Link href="/login" className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md">Login</Link>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
