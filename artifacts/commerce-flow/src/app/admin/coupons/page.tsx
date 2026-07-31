
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { adminService } from '@/services/admin.service';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ code: string; discountType: 'PERCENTAGE' | 'FLAT'; discountValue: number; minOrderAmount: string; usageLimit: string; expiresAt: string }>({ code: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderAmount: '', usageLimit: '', expiresAt: '' });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => adminService.getAllCoupons(),
  });

  const createMutation = useMutation({
    mutationFn: () => adminService.createCoupon({
      code: form.code,
      discountType: form.discountType,
      discountValue: form.discountValue,
      isActive: true,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      expiresAt: form.expiresAt || undefined,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast.success('Coupon created'); setShowForm(false); setForm({ code: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderAmount: '', usageLimit: '', expiresAt: '' }); },
    onError: () => toast.error('Failed to create coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCoupon(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }); toast.success('Coupon deleted'); },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> Add Coupon</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
              </div>
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FLAT' })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Discount Value</Label>
                <Input type="number" value={form.discountValue || ''} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Min Order Amount (optional)</Label>
                <Input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Usage Limit (optional)</Label>
                <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Expires At (optional)</Label>
                <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate()} disabled={!form.code || form.discountValue <= 0 || createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Coupon
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons?.map((coupon) => (
          <motion.div key={coupon.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg">{coupon.code}</span>
                  <Badge variant={coupon.isActive ? 'success' : 'destructive'}>{coupon.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                {coupon.description && <p className="text-sm text-muted-foreground mt-1">{coupon.description}</p>}
                <div className="mt-2 space-y-1 text-sm">
                  <p>{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}</p>
                  {coupon.minOrderAmount && <p className="text-muted-foreground">Min: ₹{coupon.minOrderAmount}</p>}
                  <p className="text-muted-foreground">Used: {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</p>
                  {coupon.expiresAt && <p className="text-muted-foreground">Expires: {formatDate(coupon.expiresAt)}</p>}
                </div>
              </div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(coupon.id)} disabled={deleteMutation.isPending}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
}
