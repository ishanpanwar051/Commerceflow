'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { adminService } from '@/services/admin.service';
import { productService } from '@/services/product.service';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', page],
    queryFn: () => adminService.getAllReviews(page),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteReview(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }); toast.success('Review deleted'); },
    onError: () => toast.error('Failed to delete review'),
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reviews</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rating</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Review</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                ) : data?.reviews.map((review) => (
                  <motion.tr key={review.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b hover:bg-muted/50">
                    <td className="p-4 text-sm font-medium">{(review as { product?: { name?: string } }).product?.name || 'N/A'}</td>
                    <td className="p-4 text-sm">{review.user.firstName} {review.user.lastName}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{review.rating}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">{review.comment || review.title || '-'}</td>
                    <td className="p-4 text-sm text-muted-foreground">{formatDate(review.createdAt)}</td>
                    <td className="p-4 text-right">
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(review.id)} disabled={deleteMutation.isPending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
