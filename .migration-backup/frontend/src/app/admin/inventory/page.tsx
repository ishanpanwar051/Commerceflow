'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['admin', 'inventory'],
    queryFn: () => adminService.getInventory(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, stock }: { productId: string; stock: number }) => adminService.updateInventory(productId, stock),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] }); toast.success('Inventory updated'); setEditingId(null); },
    onError: () => toast.error('Failed to update inventory'),
  });

  const filtered = inventory?.filter(
    (i) => i.product.name.toLowerCase().includes(search.toLowerCase()) || i.product.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product or SKU..." className="pl-10" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">SKU</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reserved</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Available</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                ) : filtered?.map((item) => {
                  const available = item.stock - item.reservedStock;
                  const isLowStock = available <= item.lowStockThreshold;
                  return (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b hover:bg-muted/50">
                      <td className="p-4 text-sm font-medium">{item.product.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{item.product.sku}</td>
                      <td className="p-4 text-sm">{editingId === item.productId ? (
                        <Input type="number" value={editStock} onChange={(e) => setEditStock(Number(e.target.value))} className="w-20 h-8" />
                      ) : item.stock}</td>
                      <td className="p-4 text-sm text-muted-foreground">{item.reservedStock}</td>
                      <td className="p-4 text-sm font-medium">{available}</td>
                      <td className="p-4">
                        {isLowStock ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </Badge>
                        ) : <Badge variant="success">In Stock</Badge>}
                      </td>
                      <td className="p-4 text-right">
                        {editingId === item.productId ? (
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" onClick={() => updateMutation.mutate({ productId: item.productId, stock: editStock })} disabled={updateMutation.isPending}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(item.productId); setEditStock(item.stock); }}>
                            Update
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
