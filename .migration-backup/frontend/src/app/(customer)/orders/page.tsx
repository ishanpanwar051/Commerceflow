'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { orderService } from '@/services/order.service';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate } from '@/lib/utils';
import { ORDER_STATUS_MAP, ORDER_STATUS_COLORS } from '@/constants';

export default function OrdersPage() {
  const { isAuthenticated } = useAuth(true);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderService.getOrders(page),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
      ) : data?.orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow"
            >
              <Link href={`/orders/${order.id}`} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{order.orderNumber}</span>
                    <Badge className={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_MAP[order.status]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                  <p className="text-sm text-muted-foreground">{order.items.length} item(s)</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">{formatPrice(order.grandTotal)}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button variant="outline" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
