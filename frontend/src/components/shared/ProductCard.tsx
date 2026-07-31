
// next/image removed;
import { Link } from 'wouter';
import { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/api';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

export function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images || [];
  const mainImage = imgError ? '/placeholder.svg' : (images[0]?.url || '/placeholder.svg');
  const hoverImage = !imgError && images.length > 1 ? images[1]?.url : mainImage;
  const inStock = product.inventory && (product.inventory.stock - product.inventory.reservedStock) > 0;
  const lowStock = product.inventory && (product.inventory.stock - product.inventory.reservedStock) <= product.inventory.lowStockThreshold;

  return (
    <div
      className="group relative rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-muted">
          <img
            src={isHovered && hoverImage !== mainImage ? hoverImage : mainImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />

          {!inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm px-3 py-1">Out of Stock</Badge>
            </div>
          )}

          {product.discountPercent && product.discountPercent > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white border-0">
              -{product.discountPercent}%
            </Badge>
          )}

          {product.isBestSeller && (
            <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white border-0 text-[10px]">
              Best Seller
            </Badge>
          )}

          {lowStock && inStock && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-medium text-destructive text-center">
                Only {product.inventory!.stock - product.inventory!.reservedStock} left in stock
              </div>
            </div>
          )}
        </div>
      </Link>

      {onToggleWishlist && (
        <button
          onClick={(e) => { e.preventDefault(); onToggleWishlist(product.id); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10 opacity-0 group-hover:opacity-100"
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      )}

      <Link href={`/products/${product.slug}`}>
        <div className="p-3 space-y-1.5">
          {product.brand && (
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{product.brand}</p>
          )}

          <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold">{product.averageRating?.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              ({product.reviewCount?.toLocaleString()})
            </span>
            {product.soldCount && product.soldCount > 0 && (
              <span className="text-[11px] text-muted-foreground">
                | {product.soldCount?.toLocaleString()} sold
              </span>
            )}
          </div>

          {product.specifications && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(product.specifications).slice(0, 2).map(([key, val]) => (
                <span key={key} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {val}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-bold">{formatPrice(product.basePrice)}</span>
            {product.originalPrice && product.originalPrice > product.basePrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            {product.freeDelivery && <span className="text-green-600 font-medium">Free Delivery</span>}
            {product.emiAvailable && <span>EMI Available</span>}
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        {onAddToCart && inStock && (
          <Button
            size="sm"
            className="w-full gap-1.5 h-8 text-xs"
            onClick={() => onAddToCart(product.id)}
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </Button>
        )}
        {!inStock && (
          <Button size="sm" variant="outline" className="w-full h-8 text-xs" disabled>
            Notify Me
          </Button>
        )}
      </div>
    </div>
  );
}
