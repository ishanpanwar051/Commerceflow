"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Menu, X, User, LogOut, Settings, Package, MapPin } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SearchBar } from "@/components/layout/SearchBar";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useAppSelector((state) => state.cart);
  const auth = useAppSelector((state) => state.auth);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    router.push("/account/profile");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              CF
            </div>
            <span className="hidden sm:inline text-xl font-bold text-foreground">
              Commerceflow
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 mx-8">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search - Mobile */}
            <button className="lg:hidden p-2 hover:bg-muted rounded-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-muted rounded-lg transition">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {auth.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">{auth.user?.name}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/account/orders")}>
                    <Package className="w-4 h-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/account/addresses")}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Addresses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/account/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border">
            <nav className="space-y-2">
              <Link
                href="/products"
                className="block px-4 py-2 hover:bg-muted rounded-lg transition"
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="block px-4 py-2 hover:bg-muted rounded-lg transition"
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="block px-4 py-2 hover:bg-muted rounded-lg transition"
              >
                About
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
