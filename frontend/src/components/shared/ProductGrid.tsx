
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types/api';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: (productId: string) => boolean;
  emptyMessage?: string;
  onRetry?: () => void;
}

export function ProductGrid({
  products,
  isLoading,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  emptyMessage = 'No products found.',
  onRetry,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-4 space-y-3 flex flex-col justify-between h-full bg-card shadow-xs">
            <div className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-2 w-1/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl mt-3" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-dashed bg-muted/20 my-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{emptyMessage}</p>
        <p className="text-xs text-muted-foreground mb-4 max-w-sm">
          Products may still be loading or server is warming up. Click refresh below to retry.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs font-semibold"
          onClick={() => {
            if (onRetry) {
              onRetry();
            } else {
              window.location.reload();
            }
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Products
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 w-full">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleWishlist={onToggleWishlist}
          isInWishlist={isInWishlist?.(product.id)}
        />
      ))}
    </div>
  );
}

