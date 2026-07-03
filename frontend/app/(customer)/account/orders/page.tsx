"use client";

import Link from "next/link";
import { useOrders } from "@/lib/hooks/useOrders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils/formatting";

export default function OrdersPage() {
  const { data: ordersData, isLoading } = useOrders();

  const orders = ordersData?.data || [];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || colors.pending;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg text-muted-foreground mb-4">You haven&apos;t placed any orders yet</p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Orders</h1>

      {orders.map((order: any) => (
        <Card key={order.id} className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-bold text-lg text-foreground">{order.orderNumber}</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col md:items-end">
              <p className="text-sm text-muted-foreground mb-2">Order Date</p>
              <p className="text-foreground">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Total</p>
              <p className="text-lg font-bold text-foreground">{formatPrice(order.total)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Items</p>
              <p className="text-lg font-bold text-foreground">{order.items.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="md:text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase">Tracking</p>
              <p className="text-foreground">{order.trackingNumber || "N/A"}</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-3">Items</h4>
            <div className="space-y-2">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm py-2">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href={`/account/orders/${order.id}`}>View Details</Link>
            </Button>
            {order.status === "delivered" && (
              <Button asChild variant="outline">
                <Link href={`/products/${order.items[0]?.productId}`}>Reorder</Link>
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
