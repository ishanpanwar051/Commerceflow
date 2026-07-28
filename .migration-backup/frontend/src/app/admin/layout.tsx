'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); }
    else if (user?.role !== 'ADMIN') { router.push('/'); }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => {
          const next = !sidebarCollapsed;
          setSidebarCollapsed(next);
          localStorage.setItem('adminSidebarCollapsed', String(next));
        }} />
        <main className={cn('flex-1 p-8 transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
          {children}
        </main>
      </div>
    </div>
  );
}
