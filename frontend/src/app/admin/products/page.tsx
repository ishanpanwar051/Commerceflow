
import { useState } from 'react';
// next/image removed;
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { productService } from '@/services/product.service';
import { formatPrice } from '@/lib/utils';
import { ProductImage } from '@/components/shared/ProductImage';
import { toast } from 'sonner';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0.01, 'Price must be > 0'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  stock: z.coerce.number().int().min(0, 'Stock must be >= 0'),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
});

type ProductForm = z.infer<typeof productSchema>;
type EditableProduct = {
  id: string; name: string; description?: string; basePrice: number; sku: string; barcode?: string; categoryId: string; isActive: boolean; isFeatured: boolean; inventory?: { stock: number; lowStockThreshold: number };
};


export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, search],
    queryFn: () => productService.getProducts({ page, limit: 10, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); toast.success('Product deleted'); },
    onError: () => toast.error('Failed to delete product'),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { isActive: true, isFeatured: false, lowStockThreshold: 5 },
  });
  const { register, handleSubmit, reset, formState: { errors } } = form;

  const openCreate = () => {
    setEditingProduct(null);
    reset({ name: '', description: '', basePrice: 0, sku: '', barcode: '', categoryId: '', isActive: true, isFeatured: false, stock: 0, lowStockThreshold: 5 });
    setShowForm(true);
  };

  const openEdit = (product: EditableProduct) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description || '',
      basePrice: product.basePrice / 100,
      sku: product.sku,
      barcode: product.barcode || '',
      categoryId: product.categoryId,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      stock: product.inventory?.stock || 0,
      lowStockThreshold: product.inventory?.lowStockThreshold || 5,
    });
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: (formData: ProductForm) => productService.createProduct({
      name: formData.name,
      description: formData.description,
      basePrice: formData.basePrice,
      sku: formData.sku,
      barcode: formData.barcode,
      categoryId: formData.categoryId,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      stock: formData.stock,
      lowStockThreshold: formData.lowStockThreshold,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); setShowForm(false); setEditingProduct(null); toast.success('Product created'); },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: productData }: { id: string; data: ProductForm }) =>
      productService.updateProduct(id, productData),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); setShowForm(false); setEditingProduct(null); toast.success('Product updated'); },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to update product');
    },
  });

  const onSubmit = async (formData: ProductForm) => {
    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct.id,
        data: {
          name: formData.name,
          description: formData.description,
          basePrice: formData.basePrice,
          sku: formData.sku,
          barcode: formData.barcode,
          categoryId: formData.categoryId,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          stock: formData.stock,
          lowStockThreshold: formData.lowStockThreshold,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="pl-10" />
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input {...register('name')} placeholder="Product name" />
                {errors.name?.message && <p className="text-xs text-destructive">{String(errors.name.message)}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU *</label>
                <Input {...register('sku')} placeholder="SKU-001" />
                {errors.sku?.message && <p className="text-xs text-destructive">{String(errors.sku.message)}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input type="number" step="0.01" {...register('basePrice')} placeholder="29.99" />
                {errors.basePrice?.message && <p className="text-xs text-destructive">{String(errors.basePrice.message)}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select {...register('categoryId')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId?.message && <p className="text-xs text-destructive">{String(errors.categoryId.message)}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock *</label>
                <Input type="number" {...register('stock')} placeholder="100" />
                {errors.stock?.message && <p className="text-xs text-destructive">{String(errors.stock.message)}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Low Stock Threshold</label>
                <Input type="number" {...register('lowStockThreshold')} placeholder="5" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Barcode</label>
                <Input {...register('barcode')} placeholder="Optional barcode" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea {...register('description')} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Product description..." />
              </div>
              <div className="flex items-center gap-6 col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('isActive')} className="rounded" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('isFeatured')} className="rounded" />
                  Featured
                </label>
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingProduct ? 'Update' : 'Create'} Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">SKU</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                ) : data?.products.map((product) => (
                  <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted overflow-hidden shrink-0 relative">
                          <ProductImage src={product.images?.[0]?.url} alt={product.name} className="absolute inset-0 w-full h-full" />
                        </div>
                        <span className="font-medium text-sm truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{product.sku}</td>
                    <td className="p-4 text-sm text-muted-foreground">{product.category?.name}</td>
                    <td className="p-4 text-sm font-semibold">{formatPrice(product.basePrice)}</td>
                    <td className="p-4 text-sm">
                      <span className={product.inventory && product.inventory.stock <= product.inventory.lowStockThreshold ? 'text-destructive font-medium' : ''}>
                        {product.inventory?.stock || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={product.isActive ? 'success' : 'destructive'}>{product.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(product)}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(product.id)} disabled={deleteMutation.isPending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button variant="outline" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
