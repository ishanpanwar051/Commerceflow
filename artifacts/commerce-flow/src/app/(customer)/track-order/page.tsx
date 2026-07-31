
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Search, MapPin, Check, Truck, Clock, PackageCheck, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { orderService } from '@/services/order.service';

const mockSteps = [
  { icon: PackageCheck, label: 'Order Placed', status: 'completed' },
  { icon: Package, label: 'Packed', status: 'completed' },
  { icon: Truck, label: 'Shipped', status: 'in-progress' },
  { icon: MapPin, label: 'Out for Delivery', status: 'pending' },
  { icon: Check, label: 'Delivered', status: 'pending' },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [searched, setSearched] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId && searched,
    retry: false,
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setSearched(true);
  };

  const getOrderStatusProgress = (status: string): string => {
    const statusMap: Record<string, string> = {
      PENDING: 'order-placed',
      CONFIRMED: 'order-placed',
      PROCESSING: 'packed',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
    };
    return statusMap[status] || 'pending';
  };

  const trackingSteps = order ? [
    { icon: PackageCheck, label: 'Order Placed', status: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'completed' : 'pending' },
    { icon: Package, label: 'Packed', status: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'completed' : order.status === 'CANCELLED' ? 'cancelled' : 'pending' },
    { icon: Truck, label: 'Shipped', status: ['SHIPPED', 'DELIVERED'].includes(order.status) ? 'completed' : order.status === 'CANCELLED' ? 'cancelled' : 'pending' },
    { icon: MapPin, label: 'Out for Delivery', status: order.status === 'DELIVERED' ? 'completed' : order.status === 'CANCELLED' ? 'cancelled' : 'pending' },
    { icon: Check, label: 'Delivered', status: order.status === 'DELIVERED' ? 'completed' : order.status === 'CANCELLED' ? 'cancelled' : 'pending' },
  ] : mockSteps;
  const isDemo = !order && !isLoading && searched && !error;

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <Package className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">Enter your order number to track the delivery status</p>
      </motion.div>

      {isDemo && (
        <div className="mb-6 p-3 rounded-lg border border-blue-200 bg-blue-50 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-700">Showing demo tracking data. Connect to a real backend for live order tracking.</p>
        </div>
      )}

      <form onSubmit={handleTrack} className="flex gap-3 mb-10">
        <Input
          placeholder="Enter order number (e.g. ORD-2024-001)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1 h-12 text-lg"
        />
        <Button type="submit" size="lg" className="px-8 gap-2">
          <Search className="h-4 w-4" /> Track
        </Button>
      </form>

      {isLoading && searched && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && searched && !isLoading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border rounded-xl p-6 bg-muted/30">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg mb-1">Order Not Found</h3>
            <p className="text-sm text-muted-foreground">Could not find order <strong>{orderId}</strong>. Please check the order number and try again.</p>
          </div>
        </motion.div>
      )}

      {!isLoading && !error && searched && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="border rounded-xl p-6 bg-muted/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-semibold text-lg">{order?.orderNumber || orderId || 'ORD-2024-001'}</p>
              </div>
              <Badge variant={order?.status === 'DELIVERED' ? 'success' : order?.status === 'CANCELLED' ? 'destructive' : 'default'} className="border-0 px-4 py-1.5">
                {order?.status ? order.status.replace(/_/g, ' ') : 'In Transit'}
              </Badge>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
              <div className="space-y-8 relative">
                {trackingSteps.map((step) => {
                  const Icon = step.icon;
                  const isActive = step.status === 'completed' || step.status === 'in-progress';
                  return (
                    <div key={step.label} className="flex items-start gap-4 pl-0">
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'in-progress' ? 'bg-blue-500 text-white ring-4 ring-blue-500/20' :
                        step.status === 'cancelled' ? 'bg-red-500 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1">
                        <p className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {step.status === 'completed' ? 'Completed' :
                           step.status === 'in-progress' ? 'In Progress' :
                           'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" /> Delivery Partner
              </h3>
              <p className="text-sm text-muted-foreground">{order?.deliveryPartner || 'Express Logistics'}</p>
              {order?.trackingId && <p className="text-xs text-muted-foreground">Tracking ID: {order.trackingId}</p>}
            </div>
            <div className="border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Estimated Delivery
              </h3>
              <p className="text-sm text-muted-foreground">Within 3-5 business days</p>
              <p className="text-xs text-muted-foreground">{order?.estimatedDelivery ? `Expected by ${new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}` : 'Expected by Jul 18, 2026'}</p>
            </div>
          </div>

          {order && (
            <div className="border rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Order Items
              </h3>
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  {item.product?.images?.[0]?.url && (
                    <img src={item.product.images[0].url} alt={item.product.name} className="h-10 w-10 rounded object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {!searched && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Enter your order number above to track your package</p>
        </div>
      )}
    </div>
  );
}
