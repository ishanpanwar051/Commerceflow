
import { Link } from 'wouter';
import { usePathname } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Truck, User } from 'lucide-react';

const sidebarItems = [
  { href: '/delivery/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/delivery/deliveries', label: 'Deliveries', icon: Truck },
  { href: '/profile', label: 'My Profile', icon: User },
];

export function DeliverySidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Portal</p>
      </div>
      <nav className="space-y-1 px-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
