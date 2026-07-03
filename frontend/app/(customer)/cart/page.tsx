"use client";

import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { removeFromCart, updateQuantity } from "@/lib/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatting";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((state) => state.cart);

  const subtotal = total;
  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 10;
  const finalTotal = subtotal + tax + shipping;

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
    } else {
      dispatch(updateQuantity({ productId, quantity }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-md mx-auto">
          <svg
            className="w-16 h-16 mx-auto text-muted-foreground mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Explore our collection and add some items to your cart
          </p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/products" className="text-primary hover:underline flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 border border-border rounded-lg p-4 bg-background hover:border-primary/50 transition"
            >
              {/* Product Image */}
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-semibold text-foreground hover:text-primary transition"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">{item.sku}</p>
                <p className="text-lg font-bold text-foreground mt-2">
                  {formatPrice(item.price)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 border border-border rounded-lg h-fit">
                <button
                  onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                  className="px-3 py-2 hover:bg-muted transition"
                >
                  −
                </button>
                <span className="px-3 py-2 font-medium min-w-12 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                  className="px-3 py-2 hover:bg-muted transition"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="font-bold text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveItem(item.productId)}
                className="p-2 hover:bg-destructive/10 text-destructive rounded transition h-fit"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-lg p-6 sticky top-20 bg-muted/30">
            <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6 border-b border-border pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600">Free shipping applied!</p>
              )}
            </div>

            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            <Button asChild className="w-full mb-3" size="lg">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>

            {/* Promo Code */}
            <div className="mt-6 pt-6 border-t border-border">
              <label className="text-sm font-medium block mb-2">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                />
                <Button variant="outline" size="sm">
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
