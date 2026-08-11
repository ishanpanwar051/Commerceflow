
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
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  fashion: 'https://i.pinimg.com/736x/51/bf/d7/51bfd722bfebbe3f79026d36e2fef1ec.jpg',
  'home-living': 'https://i.pinimg.com/736x/55/94/1a/55941a94efbe3aa64eef9fb5ffb892bc.jpg',
  essentials: 'https://i.pinimg.com/736x/ed/e5/22/ede522c0dbf11e74f3957297e64a1ce7.jpg',
  smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
  laptops: 'https://i.pinimg.com/736x/4f/17/de/4f17de878b3d044bcfd41b12e3de6257.jpg',
  headphones: 'https://i.pinimg.com/736x/1a/f6/88/1af688e1bc1284d720b0805c6d3fa8fa.jpg',
  smartwatches: 'https://i.pinimg.com/736x/2a/8c/fb/2a8cfb463273e9ae8b1b22e171329a17.jpg',
  'men-apparel': 'https://i.pinimg.com/736x/51/bf/d7/51bfd722bfebbe3f79026d36e2fef1ec.jpg',
  'women-collection': 'https://i.pinimg.com/736x/b2/bf/45/b2bf456df60ca654e8ffb99c75066a50.jpg',
  'running-shoes': 'https://i.pinimg.com/736x/9a/c0/61/9ac061f09bbba9aa2e70399ed65d0645.jpg',
  'home-decor': 'https://i.pinimg.com/736x/55/94/1a/55941a94efbe3aa64eef9fb5ffb892bc.jpg',
  cookware: 'https://i.pinimg.com/736x/67/64/00/676400bf1b3052dc9ce3c9cb5a507851.jpg',
  'sofas-beds': 'https://i.pinimg.com/736x/e6/7f/77/e67f77f0a996c561b3fa122240974edc.jpg',
  'lighting-lamps': 'https://i.pinimg.com/736x/8d/3a/4b/8d3a4b6c3e981290372fa82d1c9e8312.jpg',
  'beauty-skincare': 'https://i.pinimg.com/736x/ed/e5/22/ede522c0dbf11e74f3957297e64a1ce7.jpg',
  'fitness-gym': 'https://i.pinimg.com/736x/01/be/f4/01bef48ecceeb23edef57778aa13ee51.jpg',
  'toys-games': 'https://i.pinimg.com/736x/bf/e7/76/bfe776caeddf8263eb2b069d3ee97022.jpg',
  'pet-supplies': 'https://i.pinimg.com/736x/67/64/00/676400bf1b3052dc9ce3c9cb5a507851.jpg',
};

function getCategoryBannerImage(category: { image?: string | null; slug?: string }): string {
  if (category.image && category.image.length > 5) return category.image;
  const slug = (category.slug || '').toLowerCase();
  return CATEGORY_FALLBACK_IMAGES[slug] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
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
