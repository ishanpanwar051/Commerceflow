
import { Suspense } from 'react';
// next/image removed;
import { useRouter } from '@/lib/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/shared/ProductImage';

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  electronics: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  fashion: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
  'home-living': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  essentials: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
  smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
  laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  smartwatches: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  'men-apparel': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
  'women-collection': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
  'running-shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  'home-decor': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  cookware: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
  'sofas-beds': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
  'lighting-lamps': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
  'beauty-skincare': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80',
  'fitness-gym': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
  'toys-games': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
  'pet-supplies': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
};

function getCategoryBannerImage(category: { image?: string | null; slug?: string }): string {
  if (category.image && category.image.length > 5) return category.image;
  const slug = (category.slug || '').toLowerCase();
  return CATEGORY_FALLBACK_IMAGES[slug] || 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&w=600&q=80';
}

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {parentCategories.map((category, index) => {
          const children = childCategories.filter((c) => c.parentId === category.id);
          const bannerImg = getCategoryBannerImage(category);
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
                <div className="relative aspect-[16/7] overflow-hidden rounded-t-xl bg-muted">
                  <ProductImage
                    src={bannerImg}
                    alt={`${category.name} collection`}
                    className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
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
