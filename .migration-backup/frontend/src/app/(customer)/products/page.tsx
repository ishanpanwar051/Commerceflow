'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { SearchBar } from '@/components/shared/SearchBar';
import { Pagination } from '@/components/shared/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { productService } from '@/services/product.service';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAppSelector } from '@/store/hooks';
import { SORT_OPTIONS, ITEMS_PER_PAGE } from '@/constants';
import { toast } from 'sonner';
import type { Category } from '@/types/api';

const PRICE_RANGES = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
  { label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
  { label: 'Over ₹50,000', min: 50000, max: undefined },
];

const DISCOUNT_RANGES = [
  { label: '10% or more', value: '10' },
  { label: '20% or more', value: '20' },
  { label: '30% or more', value: '30' },
  { label: '40% or more', value: '40' },
  { label: '50% or more', value: '50' },
];

const RATINGS = [
  { label: '4★ & above', value: '4' },
  { label: '3★ & above', value: '3' },
  { label: '2★ & above', value: '2' },
  { label: '1★ & above', value: '1' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const brand = searchParams.get('brand') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const minDiscount = searchParams.get('minDiscount') || '';
  const isFeatured = searchParams.get('isFeatured') === 'true' || undefined;
  const isBestSeller = searchParams.get('isBestSeller') === 'true' || undefined;
  const isNewArrival = searchParams.get('isNewArrival') === 'true' || undefined;
  const freeDelivery = searchParams.get('freeDelivery') === 'true' || undefined;
  const cashOnDelivery = searchParams.get('cashOnDelivery') === 'true' || undefined;
  const emiAvailable = searchParams.get('emiAvailable') === 'true' || undefined;

  const queryKey = { page, search, sort, brand, categoryId, minPrice, maxPrice, minRating, minDiscount, isFeatured, isBestSeller, isNewArrival, freeDelivery, cashOnDelivery, emiAvailable };

  const { data, isLoading } = useQuery({
    queryKey: ['products', queryKey],
    queryFn: () => productService.getProducts({
      page, limit: ITEMS_PER_PAGE,
      search: search || undefined,
      sort: sort === 'newest' ? 'createdAt' : sort === 'price-asc' ? 'basePrice' : sort === 'price-desc' ? 'basePrice' : sort === 'name-asc' ? 'name' : sort === 'name-desc' ? 'name' : sort === 'rating' ? 'averageRating' : sort === 'popularity' ? 'soldCount' : sort === 'discount' ? 'discountPercent' : sort === 'trending' ? 'trendingScore' : undefined,
      order: sort === 'price-desc' || sort === 'name-desc' || sort === 'rating' || sort === 'popularity' || sort === 'discount' || sort === 'trending' ? 'desc' : 'asc',
      brand: brand || undefined,
      categoryId: categoryId || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      isFeatured,
      isBestSeller,
      isNewArrival,
      freeDelivery,
      cashOnDelivery,
      emiAvailable,
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
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
    router.replace(`/products?${params.toString()}`);
  };

  const toggleFilter = (key: string, value: string) => {
    const current = searchParams.get(key);
    if (current === value) updateFilter(key, '');
    else updateFilter(key, value);
  };

  const clearFilters = () => router.push('/products');

  const hasFilters = search || sort || brand || categoryId || minPrice || maxPrice || minRating || minDiscount || isFeatured || isBestSeller || isNewArrival || freeDelivery || cashOnDelivery || emiAvailable;

  const filterCount = [search, sort, brand, categoryId, minPrice || maxPrice, minRating, minDiscount, isFeatured, isBestSeller, isNewArrival, freeDelivery, cashOnDelivery, emiAvailable].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-4 md:py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold">
              {search ? `Results for "${search}"` : 'All Products'}
            </h1>
            <span className="text-sm text-muted-foreground">
              {data?.meta?.total || 0} products
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="hidden md:block rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Sort: Relevance</option>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 text-sm p-2 border rounded-md"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {filterCount > 0 && <span className="w-2 h-2 rounded-full bg-primary" />}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Mobile filter drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-background p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Filters</h2>
                  <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
                </div>
                <FiltersContent
                  searchParams={searchParams}
                  categories={categories}
                  toggleFilter={toggleFilter}
                  updateFilter={updateFilter}
                  clearFilters={clearFilters}
                  hasFilters={!!hasFilters}
                  showMoreFilters={showMoreFilters}
                  setShowMoreFilters={setShowMoreFilters}
                />
              </div>
            </div>
          )}

          {/* Desktop sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm">Search</h3>
                <SearchBar />
              </div>

              <FiltersContent
                searchParams={searchParams}
                categories={categories}
                toggleFilter={toggleFilter}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                hasFilters={!!hasFilters}
                showMoreFilters={showMoreFilters}
                setShowMoreFilters={setShowMoreFilters}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Active filters bar */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {search && <FilterPill label={`"${search}"`} onRemove={() => updateFilter('search', '')} />}
                {sort && <FilterPill label={SORT_OPTIONS.find(o => o.value === sort)?.label || sort} onRemove={() => updateFilter('sort', '')} />}
                {brand && <FilterPill label={brand} onRemove={() => updateFilter('brand', '')} />}
                {categoryId && <FilterPill label={categories?.find(c => c.id === categoryId)?.name || 'Category'} onRemove={() => updateFilter('categoryId', '')} />}
                {(minPrice || maxPrice) && <FilterPill label={`₹${minPrice || '0'} - ₹${maxPrice || '∞'}`} onRemove={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }} />}
                {minRating && <FilterPill label={`${minRating}★ & above`} onRemove={() => updateFilter('minRating', '')} />}
                {isFeatured && <FilterPill label="Featured" onRemove={() => updateFilter('isFeatured', '')} />}
                {isBestSeller && <FilterPill label="Best Seller" onRemove={() => updateFilter('isBestSeller', '')} />}
                {isNewArrival && <FilterPill label="New Arrival" onRemove={() => updateFilter('isNewArrival', '')} />}
                {freeDelivery && <FilterPill label="Free Delivery" onRemove={() => updateFilter('freeDelivery', '')} />}
                {cashOnDelivery && <FilterPill label="COD Available" onRemove={() => updateFilter('cashOnDelivery', '')} />}
                {emiAvailable && <FilterPill label="EMI Available" onRemove={() => updateFilter('emiAvailable', '')} />}
              </div>
            )}

            <ProductGrid
              products={data?.products || []}
              isLoading={isLoading}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isInWishlist={isInWishlist}
            />

            {data?.meta && data.meta.totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} />
              </div>
            )}

            {!isLoading && data?.products?.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:bg-primary/20 rounded-full p-0.5">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function FiltersContent({
  searchParams,
  categories,
  toggleFilter,
  updateFilter,
  clearFilters,
  hasFilters,
  showMoreFilters,
  setShowMoreFilters,
}: {
  searchParams: URLSearchParams;
  categories?: { id: string; name: string; slug: string }[];
  toggleFilter: (key: string, value: string) => void;
  updateFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  hasFilters: boolean;
  showMoreFilters: boolean;
  setShowMoreFilters: (v: boolean) => void;
}) {
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const minDiscount = searchParams.get('minDiscount') || '';
  const isFeatured = searchParams.get('isFeatured') === 'true';
  const isBestSeller = searchParams.get('isBestSeller') === 'true';
  const isNewArrival = searchParams.get('isNewArrival') === 'true';
  const freeDelivery = searchParams.get('freeDelivery') === 'true';
  const cashOnDelivery = searchParams.get('cashOnDelivery') === 'true';
  const emiAvailable = searchParams.get('emiAvailable') === 'true';

  return (
    <div className="space-y-5">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-2 text-sm flex items-center justify-between">
          Categories
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </h3>
        <div className="space-y-0.5 max-h-48 overflow-y-auto">
          <button
            onClick={() => updateFilter('categoryId', '')}
            className={`block text-xs w-full text-left px-2 py-1 rounded transition-colors ${!categoryId ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
          >
            All Categories
          </button>
          {(categories as Category[] | undefined)?.filter(c => !c.parentId).map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleFilter('categoryId', cat.id)}
              className={`block text-xs w-full text-left px-2 py-1 rounded transition-colors ${categoryId === cat.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-2 text-sm">Price</h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const isActive = minPrice === String(range.min) && (!range.max || maxPrice === String(range.max));
            return (
              <button
                key={range.label}
                onClick={() => {
                  updateFilter('minPrice', String(range.min));
                  if (range.max) updateFilter('maxPrice', String(range.max));
                  else updateFilter('maxPrice', '');
                }}
                className={`block text-xs w-full text-left px-2 py-1 rounded transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ratings */}
      <div>
        <h3 className="font-semibold mb-2 text-sm">Customer Ratings</h3>
        <div className="space-y-1">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => toggleFilter('minRating', r.value)}
              className={`block text-xs w-full text-left px-2 py-1 rounded transition-colors ${minRating === r.value ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort (mobile) */}
      <div className="md:hidden">
        <h3 className="font-semibold mb-2 text-sm">Sort By</h3>
        <select
          value={searchParams.get('sort') || ''}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs"
        >
          <option value="">Relevance</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* More Filters Toggle */}
      <button
        onClick={() => setShowMoreFilters(!showMoreFilters)}
        className="flex items-center gap-1 text-xs font-medium text-primary"
      >
        {showMoreFilters ? 'Show Less' : 'More Filters'} <ChevronDown className={`h-3 w-3 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} />
      </button>

      {showMoreFilters && (
        <div className="space-y-5 border-t pt-4">
          {/* Discount */}
          <div>
            <h3 className="font-semibold mb-2 text-sm">Discount</h3>
            <div className="space-y-1">
              {DISCOUNT_RANGES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => toggleFilter('minDiscount', d.value)}
                  className={`block text-xs w-full text-left px-2 py-1 rounded transition-colors ${minDiscount === d.value ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Featured */}
          <div>
            <h3 className="font-semibold mb-2 text-sm">Type</h3>
            <div className="space-y-1">
              <FilterCheckbox label="Featured" checked={isFeatured} onChange={() => toggleFilter('isFeatured', 'true')} />
              <FilterCheckbox label="Best Seller" checked={isBestSeller} onChange={() => toggleFilter('isBestSeller', 'true')} />
              <FilterCheckbox label="New Arrival" checked={isNewArrival} onChange={() => toggleFilter('isNewArrival', 'true')} />
            </div>
          </div>

          {/* Other Filters */}
          <div>
            <h3 className="font-semibold mb-2 text-sm">Availability</h3>
            <div className="space-y-1">
              <FilterCheckbox label="Free Delivery" checked={!!freeDelivery} onChange={() => toggleFilter('freeDelivery', 'true')} />
              <FilterCheckbox label="Cash on Delivery" checked={!!cashOnDelivery} onChange={() => toggleFilter('cashOnDelivery', 'true')} />
              <FilterCheckbox label="EMI Available" checked={!!emiAvailable} onChange={() => toggleFilter('emiAvailable', 'true')} />
            </div>
          </div>
        </div>
      )}

      {hasFilters && (
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={clearFilters}>
          <X className="h-3 w-3 mr-1" /> Clear All Filters
        </Button>
      )}
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-accent/50 rounded text-xs">
      <input type="checkbox" checked={checked} onChange={onChange} className="rounded border-gray-300" />
      {label}
    </label>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container py-8"><Skeleton className="h-96 w-full" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
