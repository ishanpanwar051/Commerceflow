
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Pencil, Trash2, Loader2, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { addressService } from '@/services/address.service';
import { getCurrentLocationAddress } from '@/lib/location';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const addressSchema = z.object({
  label: z.string().optional(),
  line1: z.string().min(1, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().optional().default('IN'),
  isDefault: z.boolean().optional().default(false),
  isShipping: z.boolean().optional().default(true),
  isBilling: z.boolean().optional().default(false),
});

export default function AddressesPage() {
  const { isAuthenticated } = useAuth(true);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const address = await getCurrentLocationAddress();
      form.reset(address);
      toast.success('Location filled. Review and save.');
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Could not get your location');
    } finally {
      setLocating(false);
    }
  };

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getAddresses(),
    enabled: isAuthenticated,
  });

  const form = useForm<z.input<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: z.input<typeof addressSchema>) => addressService.createAddress(data as Parameters<typeof addressService.createAddress>[0]),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address added'); setShowForm(false); form.reset(); },
    onError: () => toast.error('Failed to add address'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.input<typeof addressSchema> }) => addressService.updateAddress(id, data as Parameters<typeof addressService.updateAddress>[1]),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address updated'); setEditingId(null); form.reset(); },
    onError: () => toast.error('Failed to update address'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Address deleted'); },
    onError: () => toast.error('Failed to delete address'),
  });

  const handleEdit = (addr: { id: string; line1: string; line2?: string; city: string; state: string; zipCode: string; country?: string; label?: string; isDefault?: boolean; isShipping?: boolean; isBilling?: boolean }) => {
    setEditingId(addr.id);
    form.reset(addr);
    setShowForm(true);
  };

  const onSubmit = (data: z.input<typeof addressSchema>) => {
    if (editingId) updateMutation.mutate({ id: editingId, data });
    else createMutation.mutate(data);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Addresses</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); form.reset(); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Address
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <Button type="button" variant="outline" className="w-full gap-2" onClick={handleUseCurrentLocation} disabled={locating}>
                    {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                    {locating ? 'Getting your location...' : 'Use Current Location'}
                  </Button>
                  <div className="space-y-2">
                    <Label htmlFor="label">Label (optional)</Label>
                    <Input id="label" placeholder="Home, Work, etc." {...form.register('label')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="line1">Address Line 1</Label>
                    <Input id="line1" {...form.register('line1')} />
                    {form.formState.errors.line1 && <p className="text-sm text-destructive">{form.formState.errors.line1.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="line2">Address Line 2 (optional)</Label>
                    <Input id="line2" {...form.register('line2')} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...form.register('city')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" {...form.register('state')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input id="zipCode" {...form.register('zipCode')} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" {...form.register('isDefault')} />
                      <span className="text-sm">Set as default</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {editingId ? 'Update' : 'Save'} Address
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); form.reset(); }}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {addresses?.map((addr) => (
          <motion.div key={addr.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{addr.label || 'Address'}</p>
                    {addr.isDefault && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                  <div className="flex gap-2 mt-1">
                    {addr.isShipping && <span className="text-xs text-muted-foreground">Shipping</span>}
                    {addr.isBilling && <span className="text-xs text-muted-foreground">Billing</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(addr)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(addr.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        {!isLoading && addresses?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3" />
            <p>No addresses saved yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
