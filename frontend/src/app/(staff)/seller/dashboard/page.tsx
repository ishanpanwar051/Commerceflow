import { useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/userSlice';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Store, LogOut, DollarSign, ShoppingBag, Package, Star, TrendingUp,
  Plus, ExternalLink, ShieldCheck, Clock, AlertTriangle, CheckCircle2,
  RefreshCw, ArrowUpRight, Search, Edit3, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { adminService } from '@/services/admin.service';
import { formatPrice, formatDate } from '@/lib/utils';

export default function SellerDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: statsData, refetch } = useQuery({
    queryKey: ['seller', 'dashboard', 'stats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/seller/login');
  };

  const sellerName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Seller Partner';
  const sellerEmail = user?.email || 'seller@example.com';

  const mockOrders = [
    { id: 'ORD-9821', customer: 'Aarav Sharma', items: '2x Sony WH-1000XM6', total: 78639, status: 'PROCESSING', date: '2026-08-09T10:15:00Z' },
    { id: 'ORD-9818', customer: 'Diya Patel', items: '1x MacBook Pro 16"', total: 184990, status: 'SHIPPED', date: '2026-08-08T14:30:00Z' },
    { id: 'ORD-9815', customer: 'Rohan Gupta', items: '1x Galaxy Watch 8', total: 53724, status: 'DELIVERED', date: '2026-08-07T09:12:00Z' },
    { id: 'ORD-9812', customer: 'Priya Nair', items: '3x Premium Cotton Tee', total: 4497, status: 'DELIVERED', date: '2026-08-06T16:45:00Z' },
    { id: 'ORD-9809', customer: 'Vikram Singh', items: '1x Razer DeathAdder V3', total: 7392, status: 'CANCELLED', date: '2026-08-05T11:20:00Z' },
  ];

  const mockProducts = [
    { id: 'P-101', name: 'Sony WH-1000XM6 Wireless Noise Cancelling', category: 'Electronics', stock: 14, price: 39319, sales: 128 },
    { id: 'P-102', name: 'Razer DeathAdder V3 Pro Wireless Mouse', category: 'Gaming', stock: 3, price: 7392, sales: 84 },
    { id: 'P-103', name: 'MacBook Pro 16" M3 Max 32GB', category: 'Laptops', stock: 8, price: 184990, sales: 42 },
    { id: 'P-104', name: 'PlayStation 6 Next-Gen Gaming Console', category: 'Gaming', stock: 0, price: 58452, sales: 196 },
    { id: 'P-105', name: 'Bose QuietComfort Ultra Earbuds 2', category: 'Audio', stock: 22, price: 35597, sales: 67 },
  ];

  const filteredProducts = mockProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-white shadow-inner">
              <Store className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{sellerName} Storefront</h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3" /> Verified Merchant
                </Badge>
              </div>
              <p className="text-slate-300 text-sm mt-1">
                Signed in as <span className="text-white font-medium">{sellerEmail}</span> • Partner Portal Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => router.push('/')} className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-1.5">
              <ExternalLink className="h-4 w-4" /> View Live Storefront
            </Button>
            <Button size="sm" onClick={() => router.push('/products')} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-md">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300 hover:text-white hover:bg-white/10 gap-1.5">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Seller Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(statsData?.revenue || 148250)}</div>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
                <TrendingUp className="h-3 w-3" /> +18.4% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.totalOrders || 42}</div>
              <p className="text-xs text-muted-foreground mt-1">
                8 orders pending fulfillment
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                <Package className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.totalProducts || 18}</div>
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3" /> 2 low stock alerts
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Store Rating</CardTitle>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.9 / 5.0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on 124 verified customer reviews
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Store Overview', icon: Store },
          { id: 'orders', label: 'Orders & Shipping', icon: ShoppingBag },
          { id: 'products', label: 'Product Inventory', icon: Package },
          { id: 'analytics', label: 'Sales Performance', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Customer Orders</CardTitle>
                <CardDescription>Orders requiring seller dispatch and fulfillment</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')} className="gap-1 text-xs">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{order.id}</span>
                        <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'SHIPPED' ? 'default' : order.status === 'CANCELLED' ? 'destructive' : 'warning'} className="text-[10px] px-2 py-0">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{order.customer} • {order.items}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm block">{formatPrice(order.total)}</span>
                      <span className="text-[11px] text-muted-foreground">{formatDate(order.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Store Health */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <Button className="w-full justify-start gap-2 h-9 text-xs" onClick={() => router.push('/products')}>
                  <Plus className="h-4 w-4 text-indigo-400" /> Create New Listing
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => setActiveTab('products')}>
                  <Package className="h-4 w-4 text-amber-500" /> Manage Stock Levels
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => setActiveTab('orders')}>
                  <Clock className="h-4 w-4 text-blue-500" /> Pending Dispatch (8)
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-9 text-xs" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 text-emerald-500" /> Refresh Store Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Storefront Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Fulfillment Speed</span>
                  <span className="font-semibold text-emerald-600">98.4% On Time</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Order Cancellation Rate</span>
                  <span className="font-semibold text-emerald-600">0.8% (Excellent)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payout Status</span>
                  <span className="font-semibold text-indigo-600">Auto-Transfer Active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS */}
      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Seller Order Fulfillment</CardTitle>
            <CardDescription>Manage and update shipment tracking for customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 max-w-sm">
                <Input placeholder="Filter orders by ID or customer..." className="h-9 text-xs" />
              </div>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 font-semibold border-b text-muted-foreground">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Purchased Items</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-semibold">{o.id}</td>
                        <td className="p-3">{o.customer}</td>
                        <td className="p-3 text-muted-foreground">{o.items}</td>
                        <td className="p-3 text-muted-foreground">{formatDate(o.date)}</td>
                        <td className="p-3 font-bold">{formatPrice(o.total)}</td>
                        <td className="p-3">
                          <Badge variant={o.status === 'DELIVERED' ? 'success' : o.status === 'SHIPPED' ? 'default' : o.status === 'CANCELLED' ? 'destructive' : 'warning'} className="text-[10px] px-2 py-0">
                            {o.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" className="h-7 text-[11px]">Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: PRODUCTS */}
      {activeTab === 'products' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Product Catalog & Inventory</CardTitle>
              <CardDescription>Monitor stock levels and manage active listings</CardDescription>
            </div>
            <Button size="sm" onClick={() => router.push('/products')} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" /> Add New Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search inventory by name or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-xs" 
              />
            </div>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 font-semibold border-b text-muted-foreground">
                  <tr>
                    <th className="p-3">Item ID</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Stock Units</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Sales</th>
                    <th className="p-3 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-muted-foreground">{p.id}</td>
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-muted-foreground">{p.category}</td>
                      <td className="p-3">
                        <span className={`font-semibold ${p.stock === 0 ? 'text-destructive' : p.stock < 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {p.stock === 0 ? 'Out of Stock' : `${p.stock} in stock`}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{formatPrice(p.price)}</td>
                      <td className="p-3 text-muted-foreground">{p.sales} units</td>
                      <td className="p-3 text-right gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Revenue & Sales Growth</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b">
                {[
                  { month: 'Jan', val: 65 },
                  { month: 'Feb', val: 78 },
                  { month: 'Mar', val: 92 },
                  { month: 'Apr', val: 84 },
                  { month: 'May', val: 110 },
                  { month: 'Jun', val: 135 },
                  { month: 'Jul', val: 148 },
                ].map((bar) => (
                  <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-indigo-600 rounded-t-md transition-all hover:bg-indigo-500" 
                      style={{ height: `${(bar.val / 150) * 100}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">{bar.month}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">Monthly Gross Sales Volume (₹ in Thousands)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Customer Rating Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              {[
                { stars: '5 Stars', pct: 84 },
                { stars: '4 Stars', pct: 12 },
                { stars: '3 Stars', pct: 3 },
                { stars: '2 Stars', pct: 1 },
                { stars: '1 Star', pct: 0 },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="w-14 text-muted-foreground">{row.stars}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="w-8 text-right font-medium">{row.pct}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}