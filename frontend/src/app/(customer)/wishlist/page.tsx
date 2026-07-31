
import { useEffect } from 'react';
// next/image removed;
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth(true);
  const { items, isLoading, loadWishlist, removeItem } = useWishlist();
  const { addItem } = useCart();

  useEffect(() => { if (isAuthenticated) loadWishlist(); }, [isAuthenticated, loadWishlist]);

  const handleAddToCart = async (productId: string) => {
    try {
      await addItem(productId, 1);
      toast.success('Added to cart');
    } catch { toast.error('Failed to add to cart'); }
  };

  const handleRemove = async (productId: string) => {
    try { await removeItem(productId); toast.success('Removed from wishlist'); } catch { toast.error('Failed to remove'); }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="aspect-square rounded-lg mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save items you love to your wishlist.</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
            >
              <Link href={`/products/${item.product.slug}`}>
                <div className="relative aspect-square bg-muted">
                  <img src={item.product.images?.[0]?.url || '/placeholder.svg'} alt={item.product.name} className="object-cover absolute inset-0 w-full h-full object-cover" />
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="font-medium text-sm line-clamp-2 hover:text-primary">{item.product.name}</h3>
                </Link>
                <p className="text-lg font-bold mt-2">{formatPrice(item.product.basePrice)}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 gap-1" onClick={() => handleAddToCart(item.productId)}>
                    <ShoppingCart className="h-3 w-3" /> Add to Cart
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRemove(item.productId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
