"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Home,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout } from "@/lib/slices/authSlice";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const isAdminRoute = pathname?.startsWith("/admin");

  const adminItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Users", href: "/admin/users", icon: Users },
  ];

  const customerItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/products", icon: Package },
  ];

  const items = isAdminRoute ? adminItems : customerItems;

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-sidebar-foreground">
          {isAdminRoute ? "Admin Panel" : "Commerceflow"}
        </h2>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
