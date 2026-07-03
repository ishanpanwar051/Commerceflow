"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Package, Truck, MapPin, Clock, Loader2 } from "lucide-react";

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      router.push("/");
    }
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <CheckCircle className="w-24 h-24 text-green-500" />
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="p-8 mb-8">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="text-2xl font-bold text-foreground">{orderId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Date</p>
              <p className="text-foreground font-medium">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-foreground font-medium">$299.99</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Shipping Address
              </p>
              <p className="text-foreground font-medium">123 Main Street</p>
              <p className="text-sm text-muted-foreground">
                New York, NY 10001
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Estimated Delivery
              </p>
              <p className="text-foreground font-medium">
                {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>

          <hr className="mb-8" />

          {/* Order Status */}
          <div className="mb-8">
            <h3 className="font-semibold text-foreground mb-4">Order Status</h3>
            <div className="space-y-4">
              {[
                { label: "Order Placed", icon: CheckCircle, completed: true },
                { label: "Processing", icon: Clock, completed: true },
                { label: "Shipped", icon: Truck, completed: false },
                { label: "Delivered", icon: Package, completed: false },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        step.completed
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={
                        step.completed
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Order Items Summary */}
        <Card className="p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4">Order Items</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between pb-4 border-b border-border last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg" />
                  <div>
                    <p className="font-medium text-foreground">Product Name</p>
                    <p className="text-sm text-muted-foreground">Qty: 1</p>
                  </div>
                </div>
                <p className="font-medium text-foreground">$99.99</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/account/orders" className="flex-1">
            <Button variant="outline" className="w-full">
              View Order Details
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> A confirmation email has been sent to your
            registered email address. You can track your order status anytime
            from your account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
