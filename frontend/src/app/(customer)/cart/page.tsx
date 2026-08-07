
import { useEffect, useState } from 'react';
// next/image removed;
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { setCart } from '@/store/slices/cartSlice';
import { formatPrice } from '@/lib/utils';
import { ProductImage } from '@/components/shared/ProductImage';
import { cartService } from '@/services/cart.service';
import type { Coupon } from '@/types/api';
import { toast } from 'sonner';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, itemCount, subtotal, isLoading, loadCart, updateItem, removeItem, clear } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState<number | null>(null);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  useEffect(() => { if (isAuthenticated) loadCart(); }, [isAuthenticated, loadCart]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    try {
      const result = await cartService.applyCoupon(couponCode);
      dispatch(setCart(result));
      setDiscount(result.discount ?? null);
      setCoupon(result.coupon ?? null);
      toast.success('Coupon applied!');
    } catch {
      toast.error('Invalid or expired coupon');
    } finally { setApplyingCoupon(false); }
  };

  if (authLoading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Please login to view your cart</h1>
        <Link href="/login"><Button>Login</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you have not added any items yet.</p>
        <Link href="/products"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  const shipping = subtotal >= 49900 ? 0 : 4900;
  const tax = subtotal * 0.18;
  const total = subtotal - (discount || 0) + tax + shipping;

  return (
    <div className="container px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Shopping Cart ({itemCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 p-4 border rounded-lg"
              >
                <Link href={`/products/${item.product.slug}`} className="shrink-0">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-md overflow-hidden bg-muted">
                    <ProductImage src={item.product.images?.[0]?.url} alt={item.product.name} className="absolute inset-0 w-full h-full" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-medium hover:text-primary transition-colors">{item.product.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">{formatPrice(item.product.basePrice)} each</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-md">
                      <button onClick={() => updateItem(item.productId, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-accent"><Minus className="h-3 w-3" /></button>
                      <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateItem(item.productId, item.quantity + 1)} className="p-1 hover:bg-accent"><Plus className="h-3 w-3" /></button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatPrice(item.product.basePrice * item.quantity)}</span>
                      <button onClick={() => removeItem(item.productId)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex justify-between pt-4">
            <Link href="/products"><Button variant="outline">Continue Shopping</Button></Link>
            <Button variant="ghost" className="text-destructive" onClick={clear}>Clear Cart</Button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 space-y-4 sticky top-24">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount !== null && discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({coupon?.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleApplyCoupon} disabled={applyingCoupon || !couponCode}>
                Apply
              </Button>
            </div>

            <Link href="/checkout">
              <Button className="w-full gap-2" size="lg">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
