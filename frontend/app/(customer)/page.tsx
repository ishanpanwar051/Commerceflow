"use client";

import { useProducts } from "@/lib/hooks";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: productsData, isLoading } = useProducts({
    limit: 8,
  });

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Welcome to Commerceflow
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Discover premium products handpicked for you. Experience seamless shopping
            with AI-powered recommendations.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Check out our latest collection of premium items
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-96">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsData?.data?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Why Choose Commerceflow?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Fast Shipping",
                description: "Get your orders delivered in 2-5 business days.",
                icon: "🚚",
              },
              {
                title: "Secure Checkout",
                description: "Industry-leading encryption for safe transactions.",
                icon: "🔒",
              },
              {
                title: "AI Recommendations",
                description: "Personalized products based on your preferences.",
                icon: "🤖",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-background border border-border rounded-lg p-8 text-center hover:border-primary transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-primary-foreground/90 mb-6 max-w-xl mx-auto">
              Get exclusive deals, new product launches, and shopping tips delivered
              to your inbox.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded text-foreground"
              />
              <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
