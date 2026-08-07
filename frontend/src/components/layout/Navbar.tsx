
import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useRouter, usePathname } from '@/lib/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, User, Menu, X, Sun, Moon, LogOut, Package, LayoutDashboard, Search, ChevronDown, ChevronRight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/userSlice';
import { useTheme } from 'next-themes';
import { getInitials } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/deals', label: 'Deals' },
  { href: '/bestsellers', label: 'Bestsellers' },
  { href: '/new-arrivals', label: 'New Arrivals' },
];

const categoryLinks = [
  { name: 'Electronics', slug: 'electronics', icon: '🔌' },
  { name: 'Fashion Men', slug: 'fashion-men', icon: '👔' },
  { name: 'Fashion Women', slug: 'fashion-women', icon: '👗' },
  { name: 'Home Decor', slug: 'home-decor', icon: '🏠' },
  { name: 'Beauty', slug: 'beauty', icon: '💄' },
  { name: 'Sports', slug: 'sports', icon: '⚽' },
  { name: 'Books', slug: 'books', icon: '📚' },
  { name: 'Kids', slug: 'kids', icon: '🧸' },
  { name: 'Furniture', slug: 'furniture', icon: '🛋️' },
  { name: 'Automotive', slug: 'automotive', icon: '🚗' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const cart = useAppSelector((state) => state.cart.cart);
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const itemCount = cart?.itemCount || 0;
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  const handleLogout = () => { dispatch(logout()); setProfileOpen(false); };
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); if (searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setMobileSearchOpen(false); } };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="hidden lg:block border-b bg-muted/30">
        <div className="container mx-auto px-4 h-8 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Free shipping on orders over ₹499</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track-order" className="hover:text-foreground transition-colors">Track Order</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Help</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 h-14 lg:h-16 flex items-center justify-between gap-3">
        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-8 shrink-0">
          <Link href="/" className="text-lg lg:text-xl font-bold text-primary whitespace-nowrap">
            CommerceFlow
          </Link>
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1 lg:gap-2">
          <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>

          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="relative p-2 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Toggle theme">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          <Link href="/wishlist" className="relative p-2 rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Wishlist${wishlist.length > 0 ? ` (${wishlist.length} items)` : ''}`}>
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <Badge variant="destructive" className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]" aria-hidden="true">
                {wishlist.length}
              </Badge>
            )}
          </Link>

          <Link href="/cart" className="relative p-2 rounded-md hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`Shopping cart${itemCount > 0 ? ` (${itemCount} items)` : ''}`}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge variant="destructive" className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]" aria-hidden="true">
                {itemCount}
              </Badge>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 rounded-md hover:bg-muted transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs">{getInitials(user?.firstName || '', user?.lastName || '')}</AvatarFallback>
                </Avatar>
                <ChevronDown className="hidden lg:block h-3 w-3 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-2 w-56 rounded-xl border bg-popover p-1 shadow-xl">
                    <div className="px-3 py-2 border-b mb-1">
                      <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors" onClick={() => setProfileOpen(false)}>
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors" onClick={() => setProfileOpen(false)}>
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors" onClick={() => setProfileOpen(false)}>
                      <Heart className="h-4 w-4" /> Wishlist
                    </Link>
                    <Link href="/track-order" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors" onClick={() => setProfileOpen(false)}>
                      <Truck className="h-4 w-4" /> Track Order
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <>
                        <div className="border-t my-1" />
                        <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors" onClick={() => setProfileOpen(false)}>
                          <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      </>
                    )}
                    {user?.role === 'DELIVERY_BOY' && (
                      <>
                        <div className="border-t my-1" />
                        <Link href="/delivery/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors" onClick={() => setProfileOpen(false)}>
                          <Truck className="h-4 w-4" /> Delivery Dashboard
                        </Link>
                      </>
                    )}
                    <div className="border-t my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent text-destructive transition-colors">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 ml-1">
              <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link href="/register"><Button size="sm">Register</Button></Link>
            </div>
          )}

          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden border-t overflow-hidden">
            <form onSubmit={handleSearch} className="container mx-auto px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11" autoFocus />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden border-t overflow-hidden">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === link.href ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`} onClick={() => setMobileMenuOpen(false)}>
                  {link.label} <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}

              <div className="border-t my-3 pt-3">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Categories</p>
                <div className="grid grid-cols-2 gap-1">
                  {categoryLinks.map((cat) => (
                    <Link key={cat.slug} href={`/categories/${cat.slug}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      <span>{cat.icon}</span> {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t my-3 pt-3">
                <Link href="/track-order" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                  <Truck className="h-4 w-4" /> Track Order
                </Link>
                <Link href="/contact" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                  Contact Us
                </Link>
                <Link href="/faq" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                  FAQ
                </Link>
              </div>

              {!isAuthenticated && (
                <div className="flex gap-2 pt-3 border-t">
                  <Link href="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Login</Button></Link>
                  <Link href="/register" className="flex-1"><Button className="w-full" size="sm">Register</Button></Link>
                </div>
              )}
              {isAuthenticated && (
                <div className="pt-3 border-t">
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted text-destructive">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
