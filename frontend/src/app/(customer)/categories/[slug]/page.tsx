'use client';

import { useState, useCallback, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { SlidersHorizontal, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { SearchBar } from '@/components/shared/SearchBar';
import { Pagination } from '@/components/shared/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { productService } from '@/services/product.service';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAppSelector } from '@/store/hooks';
import { SORT_OPTIONS, RATING_OPTIONS, ITEMS_PER_PAGE } from '@/constants';
import { toast } from 'sonner';

function CategoryDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [showFilters, setShowFilters] = useState(false);

  const slug = params.slug as string;
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const minRating = searchParams.get('minRating') || '';

  const { data: allCategories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  });

  const category = allCategories?.find((c) => c.slug === slug);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { categoryId: category?.id, page, search, sort, minRating }],
    queryFn: () => productService.getProducts({
      page, limit: ITEMS_PER_PAGE, search: search || undefined,
      sort: sort === 'newest' ? 'createdAt' : sort === 'price-asc' ? 'basePrice' : sort === 'price-desc' ? 'basePrice' : sort === 'name-asc' ? 'name' : sort === 'name-desc' ? 'name' : sort === 'rating' ? 'averageRating' : undefined,
      order: sort === 'price-desc' || sort === 'name-desc' || sort === 'rating' ? 'desc' : 'asc',
      categoryId: category?.id,
      minRating: minRating ? Number(minRating) : undefined,
    }),
    enabled: !!category?.id && !catLoading,
  });

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

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  const clearFilters = () => router.push(`/categories/${slug}`);

  const hasFilters = search || sort || minRating;

  if (catLoading) {
    return <div className="container py-8"><Skeleton className="h-12 w-64 mb-8" /><Skeleton className="h-96" /></div>;
  }

  if (!category) {
    return (
      <div className="container py-16 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Category not found</h2>
        <p className="text-muted-foreground mb-4">The category you are looking for does not exist.</p>
        <Button onClick={() => router.push('/categories')}>Browse Categories</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <button onClick={() => router.push('/categories')} className="hover:text-foreground">Categories</button>
          <span>/</span>
          <span className="text-foreground font-medium">{category.name}</span>
        </div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && <p className="text-muted-foreground mt-1">{category.description}</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 text-sm font-medium mb-4">
          <SlidersHorizontal className="h-4 w-4" /> Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
        </button>

        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <div className="space-y-6 sticky top-24">
            <div>
              <h3 className="font-semibold mb-3">Search</h3>
              <SearchBar />
            </div>
            <div>
              <h3 className="font-semibold mb-3">Sort By</h3>
              <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Default</option>
                {SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Minimum Rating</h3>
              <div className="space-y-2">
                {RATING_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => updateFilter('minRating', String(opt.value))}
                    className={`block text-sm w-full text-left px-2 py-1 rounded ${minRating === String(opt.value) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {hasFilters && (
              <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" /> Clear Filters
              </Button>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Products</h2>
            <p className="text-sm text-muted-foreground">{data?.meta?.total || 0} products</p>
          </div>
          <ProductGrid products={data?.products || []} isLoading={isLoading}
            onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} isInWishlist={isInWishlist} />
          {data?.meta && <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} />}
        </div>
      </div>
    </div>
  );
}

export default function CategoryDetailPage() {
  return (
    <Suspense fallback={<div className="container py-8"><Skeleton className="h-96" /></div>}>
      <CategoryDetailContent />
    </Suspense>
  );
}
