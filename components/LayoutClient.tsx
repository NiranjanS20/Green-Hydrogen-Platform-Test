'use client';

import { usePathname } from 'next/navigation';
import AIChat from './AIChat';
import AppShell from '@/components/layout/AppShell';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show chat on login page
  const showChat = pathname !== '/login';

  return (
    <AppShell>
      {children}
      {showChat && <AIChat />}
    </AppShell>
  );
}
