'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/button';

function CategoriesContent() {
  const router = useRouter();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const parentCategories = categories?.filter((c) => !c.parentId) || [];
  const childCategories = categories?.filter((c) => c.parentId) || [];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">Browse our wide range of product categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parentCategories.map((category, index) => {
          const children = childCategories.filter((c) => c.parentId === category.id);
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-all group h-full"
                onClick={() => router.push(`/categories/${category.slug}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{category.description}</p>
                  )}
                  {children.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {children.slice(0, 4).map((child) => (
                        <span
                          key={child.id}
                          className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
                          onClick={(e) => { e.stopPropagation(); router.push(`/categories/${child.slug}`); }}
                        >
                          {child.name}
                        </span>
                      ))}
                      {children.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{children.length - 4} more</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {parentCategories.length === 0 && (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No categories found</h2>
          <p className="text-muted-foreground mb-4">Categories will appear here once they are added.</p>
          <Button onClick={() => router.push('/admin/categories')}>
            Add Categories
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="container py-8"><Skeleton className="h-96" /></div>}>
      <CategoriesContent />
    </Suspense>
  );
}
