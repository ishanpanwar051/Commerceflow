'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { productService } from '@/services/product.service';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: () => productService.createCategory({ name, description }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category created'); reset(); },
    onError: () => toast.error('Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: () => productService.updateCategory(editingId!, { name, description }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category updated'); reset(); },
    onError: () => toast.error('Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteCategory(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category deleted'); },
    onError: () => toast.error('Failed to delete category'),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const reset = () => { setName(''); setDescription(''); setEditingId(null); setShowForm(false); };

  const handleEdit = (cat: { id: string; name: string; description?: string }) => {
    setEditingId(cat.id); setName(cat.name); setDescription(cat.description || ''); setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingId) updateMutation.mutate();
    else createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => { setShowForm(!showForm); reset(); }}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={!name || createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={reset}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((cat) => (
          <motion.div key={cat.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{cat.name}</h3>
                {cat.description && <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={cat.isActive ? 'success' : 'secondary'}>{cat.isActive ? 'Active' : 'Inactive'}</Badge>
                  {cat.children?.length > 0 && <span className="text-xs text-muted-foreground">{cat.children.length} subcategories</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(cat.id)} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
}
