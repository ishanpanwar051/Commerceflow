
import { useRouter } from '@/lib/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DeliverySidebar } from '@/components/layout/DeliverySidebar';
import { useAppSelector } from '@/store/hooks';
import { TokenService } from '@/lib/token.service';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.user);

  const restoringSession = !isAuthenticated && TokenService.hasTokens();

  useEffect(() => {
    if (isLoading || restoringSession) return;
    if (!isAuthenticated) { router.push('/delivery/login'); }
    else if (user?.role !== 'DELIVERY_BOY') { router.push('/'); }
  }, [isAuthenticated, user, isLoading, restoringSession, router]);

  if (isLoading || restoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'DELIVERY_BOY') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <DeliverySidebar />
        <main className={cn('flex-1 p-8 ml-64')}>{children}</main>
      </div>
    </div>
  );
}
