"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchProducts } from "@/lib/hooks";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils/formatting";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: searchResults } = useSearchProducts(query);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="search"
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="w-full pl-4 pr-10"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50">
          {searchResults && searchResults.data && searchResults.data.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {searchResults.data.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="w-full px-4 py-3 hover:bg-muted flex items-center gap-3 border-b border-border last:border-b-0 transition text-left"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="px-4 py-6 text-center text-muted-foreground">
              No products found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
