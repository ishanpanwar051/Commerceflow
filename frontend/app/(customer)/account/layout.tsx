"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { useEffect } from "react";
import { User, Package, MapPin, Settings, LogOut } from "lucide-react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const accountNavItems = [
    { label: "My Profile", href: "/account/profile" },
    { label: "My Orders", href: "/account/orders" },
    { label: "Addresses", href: "/account/addresses" },
    { label: "Settings", href: "/account/settings" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Account Sidebar */}
        <aside className="w-full md:w-48">
          <h2 className="font-semibold text-lg mb-4 px-2">My Account</h2>
          <nav className="space-y-1">
            {accountNavItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition text-sm font-medium ${
                  true ? "text-foreground hover:bg-muted" : "bg-primary text-primary-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
