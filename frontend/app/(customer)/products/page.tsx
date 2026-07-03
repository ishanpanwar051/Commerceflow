"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function ProductsPageContent() {
import { useProducts, useCategories } from "@/lib/hooks";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: 0,
    maxPrice: 10000,
    page: 1,
  });

  const { data: productsData, isLoading } = useProducts({
    ...filters,
    limit: 12,
  });

  const { data: categoriesData } = useCategories();

  const handleCategoryFilter = (categoryId: string) => {
    setFilters({
      ...filters,
      category: filters.category === categoryId ? "" : categoryId,
      page: 1,
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    setFilters({
      ...filters,
      minPrice: min,
      maxPrice: max,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: 0,
      maxPrice: 10000,
      page: 1,
    });
  };

  const hasActiveFilters =
    filters.search || filters.category || filters.minPrice > 0 || filters.maxPrice < 10000;

  const sidebarItems = categoriesData
    ? categoriesData.map((cat: any) => ({
        label: cat.name,
        href: "#",
        active: filters.category === cat.id,
      }))
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Products
        </h1>
        <p className="text-muted-foreground">
          Discover our collection of premium products
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          {/* Price Filter */}
          <div className="mb-8 p-4 border border-border rounded-lg bg-muted/30">
            <h3 className="font-semibold mb-4">Price Range</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Min: ${filters.minPrice}</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handlePriceChange(parseInt(e.target.value), filters.maxPrice)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Max: ${filters.maxPrice}</label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handlePriceChange(filters.minPrice, parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8 p-4 border border-border rounded-lg bg-muted/30">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categoriesData?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryFilter(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded transition ${
                    filters.category === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-96">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {productsData?.data?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {!productsData?.data || productsData.data.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">
                    No products found. Try adjusting your filters.
                  </p>
                </div>
              ) : (
                <div className="flex justify-center gap-2">
                  {Array.from({
                    length: productsData?.pagination?.totalPages || 1,
                  }).map((_, idx) => (
                    <Button
                      key={idx + 1}
                      variant={
                        filters.page === idx + 1 ? "default" : "outline"
                      }
                      onClick={() => setFilters({ ...filters, page: idx + 1 })}
                    >
                      {idx + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
