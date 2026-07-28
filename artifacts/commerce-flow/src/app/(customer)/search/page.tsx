
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from '@/lib/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { Pagination } from '@/components/shared/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { productService } from '@/services/product.service';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAppSelector } from '@/store/hooks';
import { ITEMS_PER_PAGE } from '@/constants';
import { toast } from 'sonner';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [query, setQuery] = useState(() => searchParams.get('q') || '');

  const page = parseInt(searchParams.get('page') || '1');
  const q = searchParams.get('q') || '';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(q);
  }, [q]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', q, page],
    queryFn: () => productService.getProducts({ search: q, page, limit: ITEMS_PER_PAGE }),
    enabled: !!q,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

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

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-12 pr-12 h-14 text-lg rounded-xl"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); router.push('/search'); }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </form>
      </div>

      {q && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Results for &ldquo;{q}&rdquo;
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.meta?.total || 0} products found
          </p>
        </div>
      )}

      {!q && (
        <div className="text-center py-16">
          <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Search Products</h2>
          <p className="text-muted-foreground">Search across thousands of products</p>
        </div>
      )}

      {q && (
        <ProductGrid
          products={data?.products || []}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist}
        />
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} />
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-8"><Skeleton className="h-96" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
