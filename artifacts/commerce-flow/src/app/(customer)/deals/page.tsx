
import { useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from '@/lib/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { Pagination } from '@/components/shared/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { productService } from '@/services/product.service';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAppSelector } from '@/store/hooks';
import { ITEMS_PER_PAGE } from '@/constants';
import { toast } from 'sonner';

function DealsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading } = useQuery({
    queryKey: ['deals', page],
    queryFn: () => productService.getProducts({ page, limit: ITEMS_PER_PAGE, sort: 'discountPercent', order: 'desc' }),
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

  return (
    <div className="container py-8">
      <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-8 mb-8 border border-red-500/20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 flex-wrap">
          <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold">Today&apos;s Best Deals</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Limited time offers - Up to 70% off
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => router.push('/products')}>
            View All Products <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

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
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<div className="container py-8"><Skeleton className="h-96" /></div>}>
      <DealsContent />
    </Suspense>
  );
}
