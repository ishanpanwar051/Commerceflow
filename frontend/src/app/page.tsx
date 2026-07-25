'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Truck, Shield, HeadphonesIcon, Zap, Award, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAppDispatch } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { fetchCart } from '@/store/slices/cartSlice';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';

const heroSlides = [
  {
    title: 'Summer Collection',
    subtitle: 'Discover the latest trends',
    description: 'Up to 60% off on selected items. Limited time offer.',
    bg: 'from-blue-600 to-purple-600',
    cta: 'Shop Now',
    ctaLink: '/products',
    badge: 'New Season',
  },
  {
    title: 'Electronics Festival',
    subtitle: 'Latest gadgets at best prices',
    description: 'Extra 10% off with coupon SAVE10. Shop the best deals.',
    bg: 'from-emerald-600 to-teal-600',
    cta: 'Explore Deals',
    ctaLink: '/deals',
    badge: 'Hot Deals',
  },
  {
    title: 'Premium Fashion',
    subtitle: 'Style that speaks for you',
    description: 'New arrivals from top brands. Free shipping on all orders.',
    bg: 'from-orange-500 to-rose-500',
    cta: 'New Arrivals',
    ctaLink: '/new-arrivals',
    badge: 'Trending',
  },
];

const features = [
  { icon: Truck, title: 'Free Shipping', description: 'On orders over ₹499' },
  { icon: Shield, title: 'Secure Payment', description: '100% secure checkout' },
  { icon: HeadphonesIcon, title: '24/7 Support', description: 'Dedicated support team' },
  { icon: Zap, title: 'Fast Delivery', description: '2-3 business days' },
];

const categories = [
  { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop', color: 'from-blue-500 to-blue-700' },
  { name: 'Fashion Men', slug: 'fashion-men', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop', color: 'from-pink-500 to-rose-600' },
  { name: 'Fashion Women', slug: 'fashion-women', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=400&fit=crop', color: 'from-violet-500 to-purple-600' },
  { name: 'Home Decor', slug: 'home-decor', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', color: 'from-amber-500 to-orange-600' },
  { name: 'Beauty', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', color: 'from-fuchsia-500 to-pink-600' },
  { name: 'Sports', slug: 'sports', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop', color: 'from-green-500 to-emerald-600' },
  { name: 'Books', slug: 'books', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop', color: 'from-yellow-600 to-amber-700' },
  { name: 'Kids', slug: 'kids', image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&h=400&fit=crop', color: 'from-sky-500 to-cyan-600' },
  { name: 'Furniture', slug: 'furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', color: 'from-stone-500 to-stone-700' },
  { name: 'Automotive', slug: 'automotive', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop', color: 'from-slate-600 to-gray-800' },
];

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const [heroIndex, setHeroIndex] = useState(0);

  const { data: featuredData } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getProducts({ isFeatured: true, limit: 8 }),
  });

  const { data: bestSellerData } = useQuery({
    queryKey: ['products', 'bestsellers'],
    queryFn: () => productService.getProducts({ isBestSeller: true, limit: 8 }),
  });

  const { data: newArrivalsData } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => productService.getProducts({ isNewArrival: true, limit: 8 }),
  });

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero - Auto Sliding */}
        <section className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-gradient-to-br ${slide.bg}`}
            >
              <div className="container relative py-16 md:py-24 lg:py-32">
                <div className="max-w-3xl">
                  <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-4">
                    <Zap className="h-3 w-3" /> {slide.badge}
                  </motion.span>
                  <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
                    {slide.title}
                  </motion.h1>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg md:text-xl text-white/80 mb-2">
                    {slide.subtitle}
                  </motion.p>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-white/60 mb-8 max-w-md">
                    {slide.description}
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-3">
                    <Link href={slide.ctaLink}>
                      <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 gap-2 text-base px-8">
                        {slide.cta} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/categories">
                      <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8">
                        Browse Categories
                      </Button>
                    </Link>
                  </motion.div>
                </div>

                {/* Slide indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <button onClick={() => setHeroIndex((heroIndex - 1 + heroSlides.length) % heroSlides.length)} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {heroSlides.map((_, i) => (
                    <button key={i} onClick={() => setHeroIndex(i)} className={`h-2 rounded-full transition-all ${i === heroIndex ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`} />
                  ))}
                  <button onClick={() => setHeroIndex((heroIndex + 1) % heroSlides.length)} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Features */}
        <section className="py-8 border-y bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={feature.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="flex items-center gap-3 py-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Shop by Category</h2>
                <p className="text-sm text-muted-foreground mt-1">Browse our wide range of categories</p>
              </div>
              <Link href="/categories">
                <Button variant="ghost" className="gap-1 text-sm">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {categories.map((cat, i) => (
                <Link key={cat.slug} href={`/categories/${cat.slug}`}>
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="group relative aspect-[4/5] rounded-2xl overflow-hidden">
                    <Image src={cat.image} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 20vw" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-40 group-hover:opacity-50 transition-opacity`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-white text-sm font-bold">{cat.name}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Featured Products</h2>
                <p className="text-sm text-muted-foreground mt-1">Handpicked just for you</p>
              </div>
              <Link href="/products?isFeatured=true">
                <Button variant="ghost" className="gap-1 text-sm">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </div>
            <ProductGrid products={featuredData?.products || []} isLoading={!featuredData} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isInWishlist={isInWishlist} />
          </div>
        </section>

        {/* Banner */}
        <section className="py-12">
          <div className="container">
            <Link href="/deals">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-8 md:p-12 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:20px_20px]" />
                <div className="relative max-w-lg">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-3">Limited Time Offer</span>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">Up to 70% Off</h2>
                  <p className="text-white/80 mb-6">Don&apos;t miss out on incredible deals across all categories. Grab them before they&apos;re gone!</p>
                  <Button className="bg-white text-gray-900 hover:bg-white/90 gap-2">Shop Deals <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </motion.div>
            </Link>
          </div>
        </section>

        {/* Best Sellers */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <div>
                  <h2 className="text-2xl font-bold">Best Sellers</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Most popular products</p>
                </div>
              </div>
              <Link href="/bestsellers">
                <Button variant="ghost" className="gap-1 text-sm">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </div>
            <ProductGrid products={bestSellerData?.products || []} isLoading={!bestSellerData} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isInWishlist={isInWishlist} />
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-12">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <h2 className="text-2xl font-bold">New Arrivals</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Fresh products just dropped</p>
                </div>
              </div>
              <Link href="/new-arrivals">
                <Button variant="ghost" className="gap-1 text-sm">View All <ArrowRight className="h-3.5 w-3.5" /></Button>
              </Link>
            </div>
            <ProductGrid products={newArrivalsData?.products || []} isLoading={!newArrivalsData} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isInWishlist={isInWishlist} />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-muted/30">
          <div className="container text-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Shopping?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join thousands of satisfied customers. Get access to exclusive deals and offers.
              </p>
              <Link href={isAuthenticated ? '/products' : '/register'}>
                <Button size="lg" className="text-base px-10">
                  {isAuthenticated ? 'Browse Products' : 'Create Account'}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
