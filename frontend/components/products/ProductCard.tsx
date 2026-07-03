"use client";

import Link from "next/link";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils/formatting";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/lib/slices/cartSlice";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(
      addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        sku: product.sku,
      })
    );
  };

  const discountPercent = product.discount || 0;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="group cursor-pointer">
        {/* Image Container */}
        <div className="relative mb-4 overflow-hidden rounded-lg bg-muted aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-3 right-3 bg-destructive text-white px-2 py-1 rounded text-xs font-bold">
              -{discountPercent}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-3 left-3 p-2 rounded-full bg-white/80 hover:bg-white transition opacity-0 group-hover:opacity-100"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
              }`}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Category */}
          <p className="text-xs font-medium text-muted-foreground uppercase">
            {product.category}
          </p>

          {/* Name */}
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <p className={`text-xs font-medium ${
            product.stock > 0 ? "text-green-600" : "text-destructive"
          }`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full mt-4"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}
