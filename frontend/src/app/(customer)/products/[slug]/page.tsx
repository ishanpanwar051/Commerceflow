
import { useState } from 'react';
// next/image removed;
import { Link } from 'wouter';
import { useParams } from '@/lib/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, ShoppingCart, Star, Minus, Plus, ChevronLeft, ChevronRight, Share2, Truck, Shield, RotateCcw, Clock, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { ProductImage } from '@/components/shared/ProductImage';
import { productService } from '@/services/product.service';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAppSelector } from '@/store/hooks';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'description' | 'specs' | 'reviews'>('description');

  const queryClient = useQueryClient();
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProduct(slug),
    enabled: !!slug,
  });

  const { data: reviewsMeta } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: () => productService.getReviews(product!.id),
    enabled: !!product,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['products', 'related', product?.categoryId],
    queryFn: () => productService.getProducts({ categoryId: product!.categoryId, limit: 8 }),
    enabled: !!product,
  });

  const createReviewMutation = useMutation({
    mutationFn: (payload: { rating: number; title?: string; comment?: string }) =>
      productService.createReview(product!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product?.id] });
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      setReviewForm({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      toast.success('Review submitted');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit review');
    },
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p className="text-muted-foreground">The product you are looking for does not exist.</p>
        <Link href="/products"><Button className="mt-4">Browse Products</Button></Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [{ id: 'fallback', url: '/placeholder.svg', alt: product.name, order: 0 }];

  const availableStock = product.inventory
    ? (product.inventory.stock ?? 0) - (product.inventory.reservedStock ?? 0)
    : undefined;
  const inStock = availableStock === undefined ? true : availableStock > 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return; }
    try { await addItem(product.id, quantity); toast.success('Added to cart'); } catch { toast.error('Failed to add to cart'); }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login to manage wishlist'); return; }
    try {
      if (isInWishlist(product.id)) { await removeFromWishlist(product.id); toast.success('Removed from wishlist'); }
      else { await addToWishlist(product.id); toast.success('Added to wishlist'); }
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const discountPercent = product.discountPercent ?? (product.originalPrice ? Math.round((1 - product.basePrice / product.originalPrice) * 100) : 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-4 md:py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/categories/${product.category.slug || product.categoryId}`} className="hover:text-primary">{product.category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
              <ProductImage
                src={images[currentImage]?.url}
                alt={images[currentImage]?.alt || product.name}
                className="absolute inset-0 w-full h-full"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <button
                onClick={handleShare}
                className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Share2 className="h-4 w-4" />
              </button>
              {discountPercent > 0 && (
                <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white border-0 text-sm px-3 py-1">
                  -{discountPercent}%
                </Badge>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: { id: string; url: string; alt?: string }, i: number) => (
                  <button
                    key={img.id || i}
                    onClick={() => setCurrentImage(i)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                      i === currentImage ? 'border-primary' : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <ProductImage src={img.url} alt={img.alt || ''} className="absolute inset-0 w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            <div>
              {product.brand && (
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{product.brand}</p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-4 w-4 ${star <= Math.round(product.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold">{product.averageRating?.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  {product.reviewCount?.toLocaleString()} ratings
                </span>
                {product.soldCount && product.soldCount > 0 && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-sm text-muted-foreground">{product.soldCount.toLocaleString()} sold</span>
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatPrice(product.basePrice)}</span>
              {product.originalPrice && product.originalPrice > product.basePrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-sm text-green-600 font-medium">{discountPercent}% off</span>
                </>
              )}
            </div>

            {product.gstPercent && product.gstPercent > 0 && (
              <p className="text-xs text-muted-foreground">inclusive of {product.gstPercent}% GST</p>
            )}

            {/* Delivery & Returns */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-xl">
              {product.freeDelivery && (
                <div className="flex items-center gap-2 text-xs">
                  <Truck className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Free Delivery</span>
                </div>
              )}
              {product.deliveryEstimate && (
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>{product.deliveryEstimate}</span>
                </div>
              )}
              {product.returnPolicy && (
                <div className="flex items-center gap-2 text-xs">
                  <RotateCcw className="h-4 w-4 text-purple-600 shrink-0" />
                  <span>{product.returnPolicy}</span>
                </div>
              )}
              {product.warranty && (
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="h-4 w-4 text-orange-600 shrink-0" />
                  <span>{product.warranty}</span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <div className="flex items-center gap-1.5 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">In Stock</span>
                  {product.inventory && (
                    <span className="text-muted-foreground">
                      ({availableStock} available)
                    </span>
                  )}
                </div>
              ) : (
                <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
              )}
              {product.emiAvailable && (
                <Badge variant="secondary" className="text-[10px]">EMI Available</Badge>
              )}
              {product.cashOnDelivery && (
                <Badge variant="secondary" className="text-[10px]">COD Available</Badge>
              )}
            </div>

            {/* Seller */}
            {product.sellerName && (
              <p className="text-xs text-muted-foreground">
                Sold by <span className="font-medium text-foreground">{product.sellerName}</span>
              </p>
            )}

            {/* Key Features */}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Key Features</h3>
                <ul className="space-y-1">
                  {product.keyFeatures.slice(0, 5).map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity + Buttons */}
            {inStock && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-accent transition-colors rounded-l-lg"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-5 py-2.5 font-medium text-sm min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock ?? 99, quantity + 1))}
                    className="p-2.5 hover:bg-accent transition-colors rounded-r-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button size="lg" className="flex-1 gap-2" disabled={!inStock} onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
              <Button size="lg" variant="outline" onClick={handleToggleWishlist} className="px-4">
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare} className="px-4">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground border-t pt-4">
              {product.sku && <div><span className="font-medium text-foreground">SKU:</span> {product.sku}</div>}
              {product.countryOfOrigin && <div><span className="font-medium text-foreground">Country:</span> {product.countryOfOrigin}</div>}
              {product.material && <div><span className="font-medium text-foreground">Material:</span> {product.material}</div>}
              {product.weight && <div><span className="font-medium text-foreground">Weight:</span> {product.weight} kg</div>}
              {product.dimensions && <div><span className="font-medium text-foreground">Dimensions:</span> {product.dimensions}</div>}
            </div>

            {/* Services */}
            <div className="border rounded-xl p-4 space-y-3">
              {product.cashOnDelivery && (
                <div className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-green-600 shrink-0" /> Cash on Delivery available</div>
              )}
              {product.freeDelivery && (
                <div className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-green-600 shrink-0" /> Free Delivery on this order</div>
              )}
              {product.returnPolicy && (
                <div className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-green-600 shrink-0" /> {product.returnPolicy}</div>
              )}
              <div className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-green-600 shrink-0" /> Pay securely using your preferred payment method</div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Specs / Reviews */}
        <div className="mt-10 border-t">
          <div className="flex border-b">
            {['description', 'specs', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as 'description' | 'specs' | 'reviews')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'description' ? 'Description' : tab === 'specs' ? 'Specifications' : `Reviews (${product.reviewCount})`}
              </button>
            ))}
          </div>

          <div className="py-6">
            {selectedTab === 'description' && (
              <div className="max-w-3xl space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{product.longDescription || product.description}</p>
                {product.whatsInTheBox && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">What&apos;s in the Box</h3>
                    <ul className="space-y-1">
                      {(product.whatsInTheBox as string[]).map((item: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-green-600" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'specs' && product.specifications && (
              <div className="max-w-2xl">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specifications as Record<string, string>).map(([key, val], i) => (
                      <tr key={key} className={i % 2 === 0 ? 'bg-muted/50' : ''}>
                        <td className="px-4 py-2.5 text-sm font-medium text-muted-foreground w-1/3">{key}</td>
                        <td className="px-4 py-2.5 text-sm">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="max-w-3xl">
                {/* Rating Summary */}
                <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-xl mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{product.averageRating?.toFixed(1)}</div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-3.5 w-3.5 ${star <= Math.round(product.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{product.reviewCount} ratings</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-right">{star}★</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${star === 5 ? 60 : star === 4 ? 25 : star === 3 ? 10 : star === 2 ? 3 : 2}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write Review */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Customer Reviews</h3>
                  {isAuthenticated && (
                    <Button variant="outline" size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                      {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </Button>
                  )}
                </div>

                {showReviewForm && (
                  <div className="border rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                            <Star className={`h-5 w-5 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Review title (optional)"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    />
                    <textarea
                      placeholder="Write your review..."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    />
                    <Button
                      size="sm"
                      onClick={() => createReviewMutation.mutate(reviewForm)}
                      disabled={createReviewMutation.isPending}
                    >
                      {createReviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit Review
                    </Button>
                  </div>
                )}

                {/* Reviews List */}
                {reviewsMeta?.reviews?.length ? (
                  <div className="space-y-4">
                    {reviewsMeta.reviews.map((review) => (
                      <div key={review.id} className="border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {review.user.firstName[0]}{review.user.lastName[0]}
                            </div>
                            <div>
                              <span className="font-medium text-sm">{review.user.firstName} {review.user.lastName}</span>
                              <div className="flex items-center gap-1">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                                  ))}
                                </div>
                                {review.isVerified && (
                                  <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                                    <Check className="h-2.5 w-2.5" /> Verified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                        </div>
                        {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                        {review.comment && <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>}
                        {review.helpfulCount > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">{review.helpfulCount} people found this helpful</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts?.products && relatedProducts.products.length > 0 && (
          <div className="mt-10 border-t pt-8">
            <h2 className="text-xl font-bold mb-6">Related Products</h2>
            <ProductGrid products={relatedProducts.products.filter(p => p.id !== product.id).slice(0, 8)} />
          </div>
        )}
      </div>
    </div>
  );
}
