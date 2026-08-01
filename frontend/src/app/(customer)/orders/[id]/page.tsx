
import { useParams, useRouter } from '@/lib/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// next/image removed;

import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { orderService } from '@/services/order.service';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { ORDER_STATUS_MAP, ORDER_STATUS_COLORS } from '@/constants';
import { toast } from 'sonner';
import { useState } from 'react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth(true);
  const [cancelling, setCancelling] = useState(false);
  const id = params.id as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
    enabled: isAuthenticated,
  });

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(id);
      toast.success('Order cancelled');
      await queryClient.invalidateQueries({ queryKey: ['order', id] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch { toast.error('Failed to cancel order'); }
    finally { setCancelling(false); }
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Button variant="link" onClick={() => router.push('/orders')}>View my orders</Button>
      </div>
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  return (
    <div className="container py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={ORDER_STATUS_COLORS[order.status] + ' text-sm px-4 py-1'}>
            {ORDER_STATUS_MAP[order.status]}
          </Badge>
          {canCancel && (
            <Button variant="outline" className="text-destructive" onClick={handleCancel} disabled={cancelling}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0">
                    <img src={item.product?.images?.[0]?.url || '/placeholder.svg'} alt={item.name} className="object-cover absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                    <p className="text-sm font-semibold mt-1">{formatPrice(item.total)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(order.shippingCharge)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span>{formatPrice(order.taxAmount)}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{formatPrice(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatPrice(order.grandTotal)}</span></div>
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Shipping Address</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm">{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p className="text-sm">{order.shippingAddress.line2}</p>}
                <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              </CardContent>
            </Card>
          )}

          {order.payments?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Payment</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Status: {order.payments[0].status}</p>
                {order.payments[0].receiptUrl && (
                  <a href={order.payments[0].receiptUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block mt-1">
                    View Receipt
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
