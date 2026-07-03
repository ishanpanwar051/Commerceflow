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

  const sidebarItems = [
    { label: "My Profile", href: "/account/profile", icon: <User className="w-5 h-5" /> },
    { label: "My Orders", href: "/account/orders", icon: <Package className="w-5 h-5" /> },
    { label: "Addresses", href: "/account/addresses", icon: <MapPin className="w-5 h-5" /> },
    { label: "Settings", href: "/account/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Sidebar items={sidebarItems} title="My Account" />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
