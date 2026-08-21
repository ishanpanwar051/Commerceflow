import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Truck, Shield, HeadphonesIcon, Zap, Award, ChevronLeft, 
  ChevronRight, TrendingUp, Flame, Tag, Clock, CheckCircle2, Sparkles, ShoppingBag, Percent, Lock, RotateCcw,
  Smartphone, Shirt, Lamp, Footprints, Dumbbell, Gamepad2, CookingPot, Armchair, Laptop, Watch, Lightbulb, PawPrint, Backpack, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { ProductImage } from '@/components/shared/ProductImage';
import { useAppDispatch } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { fetchCart } from '@/store/slices/cartSlice';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';
import type { Category, Product } from '@/types/api';

// Featured Category Circles Data
const categoryCircles = [
  { name: 'Electronics', slug: 'electronics', badge: 'Up to 60% Off', icon: Smartphone },
  { name: 'Men Apparel', slug: 'men-apparel', badge: 'Min 50% Off', icon: Shirt },
  { name: 'Women Collection', slug: 'women-collection', badge: 'Trending', icon: ShoppingBag },
  { name: 'Home Decor', slug: 'home-decor', badge: 'Special Price', icon: Lamp },
  { name: 'Beauty & Skincare', slug: 'beauty-skincare', badge: 'Top Rated', icon: Sparkles },
  { name: 'Running Shoes', slug: 'running-shoes', badge: 'From ₹499', icon: Footprints },
  { name: 'Fitness & Gym', slug: 'fitness-gym', badge: 'Best Selling', icon: Dumbbell },
  { name: 'Toys & Games', slug: 'toys-games', badge: 'New Styles', icon: Gamepad2 },
  { name: 'Cookware', slug: 'cookware', badge: 'Extra 10% Off', icon: CookingPot },
  { name: 'Sofas & Beds', slug: 'sofas-beds', badge: 'Mega Savings', icon: Armchair },
];

// Main Hero Banners Data
const heroSlides = [
  {
    title: 'Flagship Smartphone Sale',
    subtitle: 'Get up to 40% OFF on top brand smartphones & premium accessories.',
    description: 'Up to 70% Off + Extra 10% Instant Discount with HDFC Cards.',
    bg: 'from-blue-700 via-indigo-700 to-purple-800',
    cta: 'Shop Tech Offers',
    ctaLink: '/categories/electronics',
    badge: 'Limited Time Deal',
    icon: Smartphone,
    categorySlug: 'smartphones',
    image: '/images/smartphone.jpg',
  },
  {
    title: 'Fashion & Apparel Carnival',
    subtitle: 'Min 50% OFF on Men & Women collections. Upgrade your style today.',
    description: 'Flat 50% - 80% Off on Men & Women Clothing & Footwear.',
    bg: 'from-rose-600 via-pink-600 to-purple-700',
    cta: 'Explore Fashion',
    ctaLink: '/categories/fashion',
    badge: 'Style Fest',
    icon: Shirt,
    categorySlug: 'men-apparel',
    image: '/images/fashion.jpg',
  },
  {
    title: 'Home & Kitchen Upgrades',
    subtitle: 'Transform your living space with cookware, furniture & lighting.',
    description: 'Transform your living space with premium home solutions from ₹299.',
    bg: 'from-emerald-700 via-teal-700 to-cyan-800',
    cta: 'Shop Home & Living',
    ctaLink: '/categories/home-living',
    badge: 'Home Special',
    icon: Home,
    categorySlug: 'home-decor',
    image: '/images/home_kitchen.jpg',
  },
];

function HeroVisual({ slide, featured }: { slide: { icon: any; categorySlug?: string; image?: string; title?: string }; featured: Product[] }) {
  const imageUrl = slide.image;
  if (!imageUrl) {
    const product = featured.find((p) => p.category?.slug === slide.categorySlug) || featured[0];
    const fallbackUrl = product?.images?.[0]?.url;
    if (!fallbackUrl) return <slide.icon className="w-40 h-40 text-white/90" />;
    return (
      <ProductImage
        src={fallbackUrl}
        alt={product?.name || 'Featured product'}
        eager
        className="absolute inset-0 w-full h-full"
      />
    );
  }
  return (
    <ProductImage
      src={imageUrl}
      alt={slide.title || 'Featured banner image'}
      eager
      className="absolute inset-0 w-full h-full"
    />
  );
}

// Amazon-style 4-in-1 Quad Spotlight Cards Data
const quadSpotlights = [
  {
    title: 'Upgrade your tech & electronics',
    linkText: 'See all tech offers',
    linkHref: '/categories/electronics',
    items: [
      { name: 'Smartphones', href: '/products?search=phone', image: '/images/quad/smartphones.jpg' },
      { name: 'Laptops', href: '/products?search=laptop', image: '/images/quad/laptops.jpg' },
      { name: 'Headphones', href: '/products?search=headphone', image: '/images/quad/headphones.jpg' },
      { name: 'Smartwatches', href: '/products?search=watch', image: '/images/quad/smartwatches.jpg' },
    ]
  },
  {
    title: 'Fashion & apparel highlights',
    linkText: 'Explore fashion deals',
    linkHref: '/categories/fashion',
    items: [
      { name: "Men's Apparel", href: '/categories/men-apparel', image: '/images/quad/mens-apparel.jpg' },
      { name: "Women's Collection", href: '/categories/women-collection', image: '/images/quad/womens-collection.jpg' },
      { name: 'Running Shoes', href: '/categories/running-shoes', image: '/images/quad/running-shoes.jpg' },
      { name: 'Bags & Accessories', href: '/products?search=bag', image: '/images/quad/bags-accessories.jpg' },
    ]
  },
  {
    title: 'Home, decor & kitchenware',
    linkText: 'Shop home decor',
    linkHref: '/categories/home-living',
    items: [
      { name: 'Home Decor', href: '/categories/home-decor', image: '/images/quad/home-decor.jpg' },
      { name: 'Cookware', href: '/categories/cookware', image: '/images/quad/cookware.jpg' },
      { name: 'Sofas & Beds', href: '/categories/sofas-beds', image: '/images/quad/sofas-beds.jpg' },
      { name: 'Lighting & Lamps', href: '/categories/lighting-lamps', image: '/images/quad/lighting-lamps.jpg' },
    ]
  },
  {
    title: 'Daily essentials & wellness',
    linkText: 'Discover essentials',
    linkHref: '/categories/essentials',
    items: [
      { name: 'Beauty & Skincare', href: '/categories/beauty-skincare', image: '/images/quad/beauty-skincare.jpg' },
      { name: 'Fitness & Gym', href: '/categories/fitness-gym', image: '/images/quad/fitness-gym.jpg' },
      { name: 'Toys & Games', href: '/categories/toys-games', image: '/images/quad/toys-games.jpg' },
      { name: 'Pet Supplies', href: '/categories/pet-supplies', image: '/images/quad/pet-supplies.jpg' },
    ]
  }
];

// Budget Filter Pills
const budgetStores = [
  { label: 'Under ₹499', href: '/products?maxPrice=499', badge: 'Everyday Essentials' },
  { label: 'Under ₹999', href: '/products?maxPrice=999', badge: 'Budget Fashion' },
  { label: 'Under ₹1,499', href: '/products?maxPrice=1499', badge: 'Popular Tech' },
  { label: 'Under ₹2,499', href: '/products?maxPrice=2499', badge: 'Home Upgrades' },
];

// Top Brand Logos
const topBrands = [
  { name: 'Apple', logo: '/images/brands/apple.svg' },
  { name: 'Samsung', logo: '/images/brands/samsung.svg' },
  { name: 'Nike', logo: '/images/brands/nike.svg' },
  { name: 'Adidas', logo: '/images/brands/adidas.svg' },
  { name: 'Sony', logo: '/images/brands/sony.svg' },
  { name: 'HP', logo: '/images/brands/hp.svg' },
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const [heroIndex, setHeroIndex] = useState(0);

  // Ticking Deal of the Day Timer (Countdown)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 23, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: featuredData, isLoading: featuredLoading, refetch: refetchFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getProducts({ isFeatured: true, limit: 8 }),
  });

  const { data: bestSellerData, isLoading: bestSellerLoading, refetch: refetchBestSeller } = useQuery({
    queryKey: ['products', 'bestsellers'],
    queryFn: () => productService.getProducts({ isBestSeller: true, limit: 8 }),
  });

  const { data: newArrivalsData, isLoading: newArrivalsLoading, refetch: refetchNewArrivals } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => productService.getProducts({ isNewArrival: true, limit: 8 }),
  });

  const { data: fallbackData, isLoading: fallbackLoading } = useQuery({
    queryKey: ['products', 'fallback'],
    queryFn: () => productService.getProducts({ limit: 12 }),
  });

  const { data: liveCategories } = useQuery({
    queryKey: ['categories', 'home'],
    queryFn: () => productService.getCategories(),
  });

  const categoryImageMap = useMemo(() => {
    const map = new Map<string, string>();
    (liveCategories || []).forEach((c: Category) => {
      if (c.image && c.slug) map.set(c.slug, c.image);
    });
    return map;
  }, [liveCategories]);

  const displayCategories = categoryCircles.map((cat) => ({
    ...cat,
    image: categoryImageMap.get(cat.slug),
  }));

  const featuredProducts = (featuredData?.products && featuredData.products.length > 0)
    ? featuredData.products.slice(0, 4)
    : (fallbackData?.products?.slice(0, 4) || []);

  const bestSellerProducts = (bestSellerData?.products && bestSellerData.products.length > 0)
    ? bestSellerData.products.slice(0, 8)
    : (fallbackData?.products?.slice(4, 12) || []);

  const newArrivalProducts = (newArrivalsData?.products && newArrivalsData.products.length > 0)
    ? newArrivalsData.products.slice(0, 8)
    : (fallbackData?.products?.slice(0, 8) || []);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  // Auto-slide hero
  useEffect(() => {
    const timer = setInterval(() => setHeroIndex((p) => (p + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = useCallback(async (productId: string) => {
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return; }
    try { await addItem(productId, 1); toast.success('Added to cart'); } catch { toast.error('Failed to add to cart'); }
  }, [addItem, isAuthenticated]);

  const handleToggleWishlist = useCallback(async (productId: string) => {
    if (!isAuthenticated) { toast.error('Please login to manage wishlist'); return; }
    try {
      if (isInWishlist(productId)) { await removeFromWishlist(productId); toast.success('Removed from wishlist'); }
      else { await addToWishlist(productId); toast.success('Added to wishlist'); }
    } catch { toast.error('Failed to update wishlist'); }
  }, [addToWishlist, removeFromWishlist, isInWishlist, isAuthenticated]);

  const slide = heroSlides[heroIndex];

  return (
    <main className="flex-1 bg-gray-50/50 dark:bg-background">
      {/* 1. Flipkart Style Top Announcement Ticker */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-medium py-2 px-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <Badge className="bg-amber-400 text-gray-900 border-0 text-[10px] uppercase font-bold animate-pulse">Bank Offer</Badge>
            <span>💳 Instant 10% Discount on HDFC & ICICI Cards | 🚚 Free Shipping Over ₹499 | ⚡ 15-Day Easy Returns</span>
          </div>
          <Link href="/deals" className="hidden md:flex items-center gap-1 hover:underline text-amber-300 font-semibold shrink-0">
            View All Offers <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* 2. Premium Category Icons Strip */}
      <section className="bg-white/90 dark:bg-card/90 backdrop-blur-md border-b py-4 shadow-sm sticky top-14 lg:top-16 z-30 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-6 overflow-x-auto scrollbar-none py-1">
            {displayCategories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="group flex flex-col items-center shrink-0 min-w-[80px] transition-transform hover:-translate-y-1 duration-300">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800/50 border border-slate-200/50 dark:border-zinc-700/30 group-hover:border-primary/40 group-hover:scale-108 shadow-xs group-hover:shadow-md transition-all duration-300 flex items-center justify-center">
                  {cat.image ? (
                    <ProductImage src={cat.image} alt={cat.name} eager className="absolute inset-0 w-full h-full" />
                  ) : (
                    <cat.icon className="w-6 h-6 text-slate-700 dark:text-zinc-300 group-hover:text-primary group-hover:rotate-6 transition-all duration-300" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-2 group-hover:text-primary transition-colors text-center line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[9px] text-primary/80 dark:text-primary font-bold bg-primary/5 dark:bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-350 px-1.5 py-0.5 rounded-full mt-1 border border-primary/10 shadow-xs">
                  {cat.badge}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Hero Banner Carousel */}
      <section className="relative overflow-hidden py-4 container mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${slide.bg} text-white shadow-xl min-h-[360px] md:min-h-[420px] flex items-center`}
          >
            <div className="container relative z-10 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
              <div>
                <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" /> {slide.badge}
                </motion.span>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
                  {slide.title}
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-base md:text-xl text-white/90 font-medium mb-2">
                  {slide.subtitle}
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-white/70 text-sm mb-6 max-w-md">
                  {slide.description}
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-3">
                  <Link href={slide.ctaLink}>
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 gap-2 font-bold shadow-lg px-8">
                      {slide.cta} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/categories">
                    <Button size="lg" variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 font-semibold px-6">
                      Explore Categories
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <div className="hidden md:flex justify-center relative">
                <div className="relative w-72 h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 rotate-2 hover:rotate-0 transition-transform duration-500 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <HeroVisual slide={slide} featured={featuredProducts} />
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              <button onClick={() => setHeroIndex((heroIndex - 1 + heroSlides.length) % heroSlides.length)} className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-xs transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setHeroIndex(i)} className={`h-2 rounded-full transition-all ${i === heroIndex ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`} />
              ))}
              <button onClick={() => setHeroIndex((heroIndex + 1) % heroSlides.length)} className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-xs transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 4. Deal of the Day Flash Sale with Live Timer */}
      <section className="py-6 container mx-auto px-4">
        <div className="bg-white dark:bg-card rounded-3xl p-6 md:p-8 border shadow-xs transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-500 shadow-inner">
                <Flame className="h-6 w-6 fill-red-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100">Deal of the Day</h2>
                  <span className="bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Flash Sale
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Handpicked premium products at lowest price guaranteed</p>
              </div>
            </div>
 
            {/* Ticking Countdown Timer */}
            <div className="flex items-center gap-3 bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 rounded-2xl px-4 py-2.5 shrink-0 shadow-xs">
              <Clock className="h-4 w-4 text-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Ends in:</span>
              <div className="flex items-center gap-1.5 text-sm font-black text-red-600 dark:text-red-400">
                <span className="bg-red-500 text-white px-2.5 py-1 rounded-xl text-xs shadow-sm font-black">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span className="text-red-500 animate-pulse">:</span>
                <span className="bg-red-500 text-white px-2.5 py-1 rounded-xl text-xs shadow-sm font-black">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span className="text-red-500 animate-pulse">:</span>
                <span className="bg-red-500 text-white px-2.5 py-1 rounded-xl text-xs shadow-sm font-black">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          </div>
 
          <ProductGrid products={featuredProducts} isLoading={featuredLoading && fallbackLoading} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isInWishlist={isInWishlist} onRetry={refetchFeatured} />
        </div>
      </section>

      {/* 5. Quad Spotlight Grid Widgets */}
      <section className="py-6 container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quadSpotlights.map((spotlight) => (
            <div key={spotlight.title} className="bg-white dark:bg-card border border-slate-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 ease-out">
              <div>
                <h3 className="font-black text-base text-slate-800 dark:text-zinc-100 tracking-tight leading-snug mb-5">{spotlight.title}</h3>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {spotlight.items.map((item) => (
                    <Link key={item.name} href={item.href} className="group block">
                      <div className="aspect-square rounded-2xl bg-slate-50 dark:bg-zinc-800/30 overflow-hidden mb-2 relative border border-slate-100 dark:border-zinc-800/80 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-350 flex items-center justify-center">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-all duration-300"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 group-hover:text-primary transition-colors line-clamp-1">{item.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
              <Link href={spotlight.linkHref} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 pt-3 border-t border-slate-100 dark:border-zinc-800/80 group/link">
                {spotlight.linkText} <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Flipkart Style Budget Store / Quick Price Filters */}
      <section className="py-6 container mx-auto px-4">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-200" />
                <h2 className="text-2xl font-black">Budget Store</h2>
              </div>
              <p className="text-xs text-white/80 mt-1">Shop incredible deals tailored to your exact budget</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {budgetStores.map((store) => (
                <Link key={store.label} href={store.href}>
                  <Button variant="outline" className="w-full bg-white/10 hover:bg-white text-white hover:text-gray-900 border-white/30 flex flex-col h-auto py-2 px-4 transition-all">
                    <span className="font-black text-sm">{store.label}</span>
                    <span className="text-[10px] opacity-80 font-normal">{store.badge}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Best Sellers Section */}
      <section className="py-6 container mx-auto px-4">
        <div className="bg-white dark:bg-card border rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <div>
                <h2 className="text-2xl font-bold">Best Sellers</h2>
                <p className="text-xs text-muted-foreground">Most popular items bought by customers</p>
              </div>
            </div>
            <Link href="/bestsellers">
              <Button variant="ghost" size="sm" className="gap-1 text-xs font-bold">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
          <ProductGrid products={bestSellerProducts} isLoading={bestSellerLoading && fallbackLoading} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isInWishlist={isInWishlist} onRetry={refetchBestSeller} />
        </div>
      </section>

      {/* 8. Brand Spotlight Strip */}
      <section className="py-6 container mx-auto px-4">
        <div className="bg-white dark:bg-card border rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-foreground uppercase tracking-wider text-xs">Featured Official Brands</h3>
            <span className="text-xs text-muted-foreground">100% Verified Authentic</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {topBrands.map((b) => (
              <div key={b.name} className="border rounded-xl p-3 flex flex-col items-center justify-center gap-2 bg-muted/20 hover:border-primary transition-colors group">
                <div className="w-full max-w-[120px] h-12 bg-white rounded-xl border border-slate-100/80 p-2.5 flex items-center justify-center shadow-xs">
                  <img 
                    src={b.logo} 
                    alt={b.name}
                    className="h-full object-contain transition-transform group-hover:scale-108 duration-300"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-bold text-foreground">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. New Arrivals Section */}
      <section className="py-6 container mx-auto px-4">
        <div className="bg-white dark:bg-card border rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <h2 className="text-2xl font-bold">New Arrivals</h2>
                <p className="text-xs text-muted-foreground">Fresh products just added to our catalog</p>
              </div>
            </div>
            <Link href="/new-arrivals">
              <Button variant="ghost" size="sm" className="gap-1 text-xs font-bold">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
          <ProductGrid products={newArrivalProducts} isLoading={newArrivalsLoading && fallbackLoading} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isInWishlist={isInWishlist} onRetry={refetchNewArrivals} />
        </div>
      </section>

      {/* 10. Trust & Service Strip */}
      <section className="py-10 border-t bg-white dark:bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/10">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Free & Fast Delivery</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">On orders over ₹499</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/10">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Secure Payments</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">256-bit SSL encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/10">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs">15-Day Easy Returns</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Hassle-free replacement</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/10">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs">100% Genuine Products</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Directly from brands</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/10">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                <HeadphonesIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs">24/7 Customer Support</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Dedicated assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
