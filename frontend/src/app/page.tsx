import { useEffect, useState, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Truck, Shield, HeadphonesIcon, Zap, Award, ChevronLeft, 
  ChevronRight, TrendingUp, Flame, Tag, Clock, CheckCircle2, Sparkles, ShoppingBag, Percent, Lock, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { useAppDispatch } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { ProductImage } from '@/components/shared/ProductImage';
import { fetchCart } from '@/store/slices/cartSlice';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';

// Featured Category Circles Data
const categoryCircles = [
  { name: 'Electronics', slug: 'electronics', image: 'https://i.pinimg.com/736x/49/00/bf/4900bf9f52cc4028460dd668965e3760.jpg', badge: 'Up to 60% Off' },
  { name: 'Men Apparel', slug: 'men-apparel', image: 'https://i.pinimg.com/1200x/ca/5f/9a/ca5f9a99d891b97105329bd2b51f365f.jpg', badge: 'Min 50% Off' },
  { name: 'Women Collection', slug: 'women-collection', image: 'https://i.pinimg.com/736x/70/25/d3/7025d32eb041dcf39acfe72879257da6.jpg', badge: 'Trending' },
  { name: 'Home Decor', slug: 'home-decor', image: 'https://i.pinimg.com/1200x/6e/f9/e9/6ef9e9c5f36fc0fa6591a0ebf6e2fc9d.jpg', badge: 'Special Price' },
  { name: 'Beauty & Skincare', slug: 'beauty-skincare', image: 'https://i.pinimg.com/1200x/72/ce/f6/72cef6821b8ff19188d20d7595669b39.jpg', badge: 'Top Rated' },
  { name: 'Running Shoes', slug: 'running-shoes', image: 'https://i.pinimg.com/736x/74/fa/7b/74fa7bd1f20f012610d7f9e08dac3297.jpg', badge: 'From ₹499' },
  { name: 'Fitness & Gym', slug: 'fitness-gym', image: 'https://i.pinimg.com/736x/a5/54/24/a55424d42aaadfff1aa245fcc95cd191.jpg', badge: 'Best Selling' },
  { name: 'Toys & Games', slug: 'toys-games', image: 'https://i.pinimg.com/1200x/b8/01/ec/b801ec420edae1904bcd6f60b6151445.jpg', badge: 'New Styles' },
  { name: 'Cookware', slug: 'cookware', image: 'https://i.pinimg.com/736x/7b/1e/ca/7b1eca81497bc26431a8cc38caa5d314.jpg', badge: 'Extra 10% Off' },
  { name: 'Sofas & Beds', slug: 'sofas-beds', image: 'https://i.pinimg.com/736x/33/90/6a/33906a8fb31f7cedaf743956b8e968ed.jpg', badge: 'Mega Savings' },
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
    image: 'https://i.pinimg.com/1200x/4b/dd/d5/4bddd5133527509b0370a266932c12f5.jpg',
  },
  {
    title: 'Fashion & Apparel Carnival',
    subtitle: 'Min 50% OFF on Men & Women collections. Upgrade your style today.',
    description: 'Flat 50% - 80% Off on Men & Women Clothing & Footwear.',
    bg: 'from-rose-600 via-pink-600 to-purple-700',
    cta: 'Explore Fashion',
    ctaLink: '/categories/fashion',
    badge: 'Style Fest',
    image: 'https://i.pinimg.com/1200x/cc/99/73/cc9973b9183688b983c16e1891dcceb0.jpg',
  },
  {
    title: 'Home & Kitchen Upgrades',
    subtitle: 'Transform your living space with cookware, furniture & lighting.',
    description: 'Transform your living space with premium home solutions from ₹299.',
    bg: 'from-emerald-700 via-teal-700 to-cyan-800',
    cta: 'Shop Home & Living',
    ctaLink: '/categories/home-living',
    badge: 'Home Special',
    image: 'https://i.pinimg.com/1200x/4b/dd/d5/4bddd5133527509b0370a266932c12f5.jpg',
  },
];

// Amazon-style 4-in-1 Quad Spotlight Cards Data
const quadSpotlights = [
  {
    title: 'Upgrade your tech & electronics',
    linkText: 'See all tech offers',
    linkHref: '/categories/electronics',
    items: [
      { name: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', href: '/products?search=phone' },
      { name: 'Laptops', image: 'https://i.pinimg.com/736x/4f/17/de/4f17de878b3d044bcfd41b12e3de6257.jpg', href: '/products?search=laptop' },
      { name: 'Headphones', image: 'https://i.pinimg.com/736x/1a/f6/88/1af688e1bc1284d720b0805c6d3fa8fa.jpg', href: '/products?search=headphone' },
      { name: 'Smartwatches', image: 'https://i.pinimg.com/736x/2a/8c/fb/2a8cfb463273e9ae8b1b22e171329a17.jpg', href: '/products?search=watch' },
    ]
  },
  {
    title: 'Fashion & apparel highlights',
    linkText: 'Explore fashion deals',
    linkHref: '/categories/fashion',
    items: [
      { name: "Men's Apparel", image: 'https://i.pinimg.com/736x/51/bf/d7/51bfd722bfebbe3f79026d36e2fef1ec.jpg', href: '/categories/men-apparel' },
      { name: "Women's Collection", image: 'https://i.pinimg.com/736x/b2/bf/45/b2bf456df60ca654e8ffb99c75066a50.jpg', href: '/categories/women-collection' },
      { name: 'Running Shoes', image: 'https://i.pinimg.com/736x/9a/c0/61/9ac061f09bbba9aa2e70399ed65d0645.jpg', href: '/categories/running-shoes' },
      { name: 'Bags & Accessories', image: 'https://i.pinimg.com/736x/ed/e5/22/ede522c0dbf11e74f3957297e64a1ce7.jpg', href: '/products?search=bag' },
    ]
  },
  {
    title: 'Home, decor & kitchenware',
    linkText: 'Shop home decor',
    linkHref: '/categories/home-living',
    items: [
      { name: 'Home Decor', image: 'https://i.pinimg.com/736x/55/94/1a/55941a94efbe3aa64eef9fb5ffb892bc.jpg', href: '/categories/home-decor' },
      { name: 'Cookware', image: 'https://i.pinimg.com/736x/67/64/00/676400bf1b3052dc9ce3c9cb5a507851.jpg', href: '/categories/cookware' },
      { name: 'Sofas & Beds', image: 'https://i.pinimg.com/736x/e6/7f/77/e67f77f0a996c561b3fa122240974edc.jpg', href: '/categories/sofas-beds' },
      { name: 'Lighting & Lamps', image: 'https://i.pinimg.com/736x/8d/3a/4b/8d3a4b6c3e981290372fa82d1c9e8312.jpg', href: '/categories/lighting-lamps' },
    ]
  },
  {
    title: 'Daily essentials & wellness',
    linkText: 'Discover essentials',
    linkHref: '/categories/essentials',
    items: [
      { name: 'Beauty & Skincare', image: 'https://i.pinimg.com/736x/ed/e5/22/ede522c0dbf11e74f3957297e64a1ce7.jpg', href: '/categories/beauty-skincare' },
      { name: 'Fitness & Gym', image: 'https://i.pinimg.com/736x/01/be/f4/01bef48ecceeb23edef57778aa13ee51.jpg', href: '/categories/fitness-gym' },
      { name: 'Toys & Games', image: 'https://i.pinimg.com/736x/bf/e7/76/bfe776caeddf8263eb2b069d3ee97022.jpg', href: '/categories/toys-games' },
      { name: 'Pet Supplies', image: 'https://i.pinimg.com/736x/67/64/00/676400bf1b3052dc9ce3c9cb5a507851.jpg', href: '/categories/pet-supplies' },
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
  { name: 'Apple', logo: 'https://i.pinimg.com/1200x/ba/d5/77/bad5770f437f1d95a70de20175464bda.jpg' },
  { name: 'Samsung', logo: 'https://i.pinimg.com/736x/97/14/fb/9714fbfc0fe4761842a16bbf3622f88c.jpg' },
  { name: 'Nike', logo: 'https://i.pinimg.com/736x/9a/c0/61/9ac061f09bbba9aa2e70399ed65d0645.jpg' },
  { name: 'Adidas', logo: 'https://i.pinimg.com/736x/51/bf/d7/51bfd722bfebbe3f79026d36e2fef1ec.jpg' },
  { name: 'Sony', logo: 'https://i.pinimg.com/736x/1a/f6/88/1af688e1bc1284d720b0805c6d3fa8fa.jpg' },
  { name: 'HP', logo: 'https://i.pinimg.com/736x/4f/17/de/4f17de878b3d044bcfd41b12e3de6257.jpg' },
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

      {/* 2. Flipkart Style Category Circles Strip */}
      <section className="bg-white dark:bg-card border-b py-4 shadow-xs sticky top-14 lg:top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none py-1">
            {categoryCircles.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="group flex flex-col items-center shrink-0 min-w-[76px] transition-transform hover:-translate-y-1">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary p-0.5 bg-muted shadow-sm transition-all">
                  <ProductImage src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-xs font-medium text-foreground mt-1.5 group-hover:text-primary transition-colors text-center line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
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
                <div className="relative w-72 h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 rotate-2 hover:rotate-0 transition-transform duration-500">
                  <ProductImage src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
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

      {/* 4. Flipkart "Deal of the Day" Flash Sale with Live Timer */}
      <section className="py-6 container mx-auto px-4">
        <div className="bg-white dark:bg-card rounded-2xl p-6 border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                <Flame className="h-6 w-6 fill-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight">Deal of the Day</h2>
                  <Badge className="bg-red-500 text-white font-bold text-xs uppercase px-2 py-0.5">Flash Sale</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Handpicked premium products at lowest price guaranteed</p>
              </div>
            </div>

            {/* Ticking Countdown Timer */}
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-2">
              <Clock className="h-4 w-4 text-red-500 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-xs font-bold text-red-600 dark:text-red-400">Ends in:</span>
              <div className="flex items-center gap-1 text-sm font-black text-red-600 dark:text-red-400">
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs">{String(timeLeft.hours).padStart(2, '0')}h</span> :
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs">{String(timeLeft.minutes).padStart(2, '0')}m</span> :
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          </div>

          <ProductGrid products={featuredProducts} isLoading={featuredLoading && fallbackLoading} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isInWishlist={isInWishlist} onRetry={refetchFeatured} />
        </div>
      </section>

      {/* 5. Amazon Style 4-in-1 Quad Spotlights */}
      <section className="py-6 container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quadSpotlights.map((spotlight) => (
            <div key={spotlight.title} className="bg-white dark:bg-card border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-bold text-lg leading-tight mb-4 text-foreground">{spotlight.title}</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {spotlight.items.map((item) => (
                    <Link key={item.name} href={item.href} className="group block">
                      <div className="aspect-square rounded-xl bg-muted overflow-hidden mb-1.5 relative border group-hover:border-primary transition-all">
                        <ProductImage src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{item.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
              <Link href={spotlight.linkHref} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 pt-2 border-t">
                {spotlight.linkText} <ArrowRight className="h-3 w-3" />
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
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-xs p-1">
                  <ProductImage src={b.logo} alt={b.name} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform" />
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
