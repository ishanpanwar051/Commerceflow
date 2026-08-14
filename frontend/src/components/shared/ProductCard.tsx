
// next/image removed;
import { Link } from 'wouter';
import { useState, useCallback, memo } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/api';
import { ProductImage } from '@/components/shared/ProductImage';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

function ProductCardComponent({ product, onAddToCart, onToggleWishlist, isInWishlist }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images || [];
  const availableStock = product.inventory
    ? (product.inventory.stock ?? 0) - (product.inventory.reservedStock ?? 0)
    : undefined;
  const inStock = availableStock === undefined ? true : availableStock > 0;
  const lowStock = availableStock !== undefined && availableStock > 0
    && availableStock <= (product.inventory?.lowStockThreshold ?? 5);

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        <Link href={`/products/${product.slug}`} className="block relative">
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            <ProductImage
              src={images[0]?.url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-106 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {!inStock && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
                <Badge variant="destructive" className="text-xs px-3 py-1 font-bold tracking-wide">Out of Stock</Badge>
              </div>
            )}

            {product.discountPercent && product.discountPercent > 0 && (
              <Badge className={`absolute left-3 bg-red-500 hover:bg-red-600 text-white font-bold border-0 text-[10px] px-2 py-0.5 rounded shadow-sm ${product.isBestSeller ? 'top-10' : 'top-3'}`}>
                -{product.discountPercent}%
              </Badge>
            )}

            {product.isBestSeller && (
              <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600 text-white border-0 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded shadow-sm">
                Best Seller
              </Badge>
            )}

            {lowStock && inStock && (
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <div className="bg-destructive/90 text-destructive-foreground backdrop-blur-xs rounded-lg px-2 py-1 text-[10px] font-bold text-center shadow-xs border border-destructive/20">
                  Only {availableStock} left in stock
                </div>
              </div>
            )}
          </div>
        </Link>

        {onToggleWishlist && (
          <button
            onClick={(e) => { e.preventDefault(); onToggleWishlist(product.id); }}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/90 dark:bg-muted/95 backdrop-blur-md hover:bg-background transition-all duration-200 z-10 shadow-sm border opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-foreground'}`} />
          </button>
        )}

        <div className="p-4 space-y-2">
          {product.brand && (
            <p className="text-[10px] text-primary/80 dark:text-primary font-bold uppercase tracking-wider">{product.brand}</p>
          )}

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug h-10">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-0.5 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded text-[11px] font-bold">
              <Star className="h-3 w-3 fill-current" />
              <span>{product.averageRating ? product.averageRating.toFixed(1) : 'New'}</span>
            </div>
            {product.reviewCount ? (
              <span className="text-[11px] text-muted-foreground font-medium">
                ({product.reviewCount.toLocaleString()})
              </span>
            ) : null}
            {product.soldCount && product.soldCount > 0 && (
              <span className="text-[11px] text-muted-foreground font-medium">
                • {product.soldCount?.toLocaleString()} sold
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1.5 flex-wrap pt-1">
            <span className="text-lg font-black text-foreground">{formatPrice(product.basePrice)}</span>
            {product.originalPrice && product.originalPrice > product.basePrice && (
              <span className="text-xs text-muted-foreground line-through font-medium">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
        {onAddToCart && inStock && (
          <Button
            size="sm"
            className="w-full gap-2 h-9 text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200 rounded-xl"
            onClick={() => onAddToCart(product.id)}
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </Button>
        )}
        {!inStock && (
          <Button size="sm" variant="outline" className="w-full h-9 text-xs font-bold rounded-xl" disabled>
            Notify Me
          </Button>
        )}
        <div className="flex items-center justify-between text-[9px] font-semibold text-muted-foreground/80 px-1">
          {product.freeDelivery ? (
            <span className="text-green-600 dark:text-green-400">Free Delivery</span>
          ) : (
            <span>Standard Shipping</span>
          )}
          {product.emiAvailable && <span>EMI Option</span>}
        </div>
      </div>
    </div>
  );
}

export const ProductCard = memo(ProductCardComponent);
