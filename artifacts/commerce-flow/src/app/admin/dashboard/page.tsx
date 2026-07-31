
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';
import { formatPrice, formatDate } from '@/lib/utils';

const statCards = [
  { key: 'revenue', label: 'Total Revenue', icon: DollarSign, format: (v: number) => formatPrice(v) },
  { key: 'totalOrders', label: 'Total Orders', icon: ShoppingCart, format: (v: number) => String(v) },
  { key: 'totalProducts', label: 'Products', icon: Package, format: (v: number) => String(v) },
  { key: 'totalCustomers', label: 'Customers', icon: Users, format: (v: number) => String(v) },
];

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboardStats(),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const value = data ? (data as Record<string, unknown>)[stat.key] as number : 0;
          return (
            <motion.div key={stat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? <Skeleton className="h-8 w-24" /> : (
                    <div className="text-2xl font-bold">{stat.format(value)}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            ) : (
              <div className="space-y-3">
                {data?.recentOrders?.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatPrice(order.grandTotal)}</span>
                      <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'destructive' : 'warning'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            ) : (
              <div className="space-y-3">
                {data?.topProducts?.slice(0, 5).map((product, i) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground w-5">{i + 1}.</span>
                      <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(product.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
