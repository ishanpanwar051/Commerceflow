"use client";

import { useState } from "react";
import { useProduct, useProductReviews } from "@/lib/hooks";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/lib/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Star, Heart, Share2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/formatting";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { data: product, isLoading } = useProduct(params.id);
  const { data: reviewsData } = useProductReviews(params.id);
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
        sku: product.sku,
      })
    );
  };

  const discountPercent = product.discount || 0;
  const rating = Math.round(product.rating);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <div className="absolute top-4 right-4 bg-destructive text-white px-3 py-1 rounded-full font-bold">
                -{discountPercent}%
              </div>
            )}
          </div>
          {product.images && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-70 transition"
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          {/* Category & Name */}
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {product.name}
            </h1>
            <p className="text-muted-foreground">{product.sku}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="border-t border-b border-border py-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {product.originalPrice && (
              <p className="text-sm text-green-600 mt-2">
                Save {formatPrice(product.originalPrice - product.price)}
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-destructive"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Quantity:</label>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted transition"
                >
                  −
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock || 10, quantity + 1))
                  }
                  className="px-3 py-2 hover:bg-muted transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1"
                size="lg"
              >
                Add to Cart
              </Button>
              <Button
                onClick={() => setIsFavorite(!isFavorite)}
                variant="outline"
                size="lg"
                className="px-6"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? "fill-destructive text-destructive" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          {/* Share */}
          <Button variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share Product
          </Button>

          {/* Additional Info */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <strong>Free Shipping:</strong> On orders over $50
            </p>
            <p className="text-sm">
              <strong>30-Day Returns:</strong> No questions asked
            </p>
            <p className="text-sm">
              <strong>Secure Checkout:</strong> 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-border pt-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">Customer Reviews</h2>
        {reviewsData && reviewsData.data && reviewsData.data.length > 0 ? (
          <div className="space-y-6">
            {reviewsData.data.map((review: any) => (
              <div
                key={review.id}
                className="border border-border rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{review.title}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  {review.comment}
                </p>
                <p className="text-xs text-muted-foreground">
                  {review.helpful} people found this helpful
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet</p>
        )}
      </div>
    </div>
  );
}
