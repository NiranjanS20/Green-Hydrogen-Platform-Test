'use client';

import { usePathname } from 'next/navigation';
import AIChat from './AIChat';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show chat on login page
  const showChat = pathname !== '/login';

  return (
    <>
      {children}
      {showChat && <AIChat />}
    </>
  );
}
