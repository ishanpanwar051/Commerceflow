import Link from "next/link";

// Mock products for demo  
const MOCK_PRODUCTS = [
  {
    id: "1",
    sku: "TECH-001",
    name: "Premium Wireless Headphones",
    description: "High-quality sound with noise cancellation",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviewCount: 324,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    category: "Electronics",
    stock: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    sku: "FASH-001",
    name: "Elegant Wrist Watch",
    description: "Luxury timepiece with elegant design",
    price: 199.99,
    originalPrice: 299.99,
    rating: 4.6,
    reviewCount: 156,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=500&fit=crop",
    category: "Fashion",
    stock: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    sku: "TECH-002",
    name: "Professional Camera",
    description: "4K video and 20MP photography",
    price: 799.99,
    originalPrice: 999.99,
    rating: 4.9,
    reviewCount: 512,
    image: "https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=500&h=500&fit=crop",
    category: "Electronics",
    stock: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    sku: "FASH-002",
    name: "Leather Backpack",
    description: "Durable and stylish travel companion",
    price: 129.99,
    originalPrice: 179.99,
    rating: 4.7,
    reviewCount: 289,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    category: "Fashion",
    stock: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    sku: "TECH-003",
    name: "Smart Phone Stand",
    description: "Adjustable stand for all devices",
    price: 29.99,
    originalPrice: 49.99,
    rating: 4.5,
    reviewCount: 178,
    image: "https://images.unsplash.com/photo-1605787020600-b6df44d614c5?w=500&h=500&fit=crop",
    category: "Accessories",
    stock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    sku: "TECH-004",
    name: "Portable Speaker",
    description: "360-degree sound with 12-hour battery",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.8,
    reviewCount: 421,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
    category: "Electronics",
    stock: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    sku: "TECH-005",
    name: "Wireless Mouse",
    description: "Ergonomic design with precision control",
    price: 49.99,
    originalPrice: 79.99,
    rating: 4.6,
    reviewCount: 267,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop",
    category: "Electronics",
    stock: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    sku: "FASH-003",
    name: "Sunglasses",
    description: "UV protection with premium lenses",
    price: 159.99,
    originalPrice: 239.99,
    rating: 4.7,
    reviewCount: 334,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
    category: "Fashion",
    stock: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function HomePage() {
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
            <a href="/products" className="px-6 py-2 bg-primary text-white rounded-md hover:opacity-90">Shop Now</a>
            <a href="/about" className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white">Learn More</a>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 border rounded-lg">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop" alt="Product" className="w-full h-48 object-cover rounded-md mb-3" />
              <h3 className="font-semibold text-sm mb-1">Premium Wireless Headphones</h3>
              <p className="text-xs text-muted-foreground mb-2">High-quality sound</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">$299.99</p>
                  <p className="text-xs text-muted-foreground line-through">$399.99</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-xs">4.8</span>
                </div>
              </div>
              <button className="w-full mt-3 bg-primary text-white py-1 rounded text-sm">Add to Cart</button>
            </div>
            <div className="p-4 border rounded-lg">
              <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=500&fit=crop" alt="Product" className="w-full h-48 object-cover rounded-md mb-3" />
              <h3 className="font-semibold text-sm mb-1">Elegant Wrist Watch</h3>
              <p className="text-xs text-muted-foreground mb-2">Luxury design</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">$199.99</p>
                  <p className="text-xs text-muted-foreground line-through">$299.99</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-xs">4.6</span>
                </div>
              </div>
              <button className="w-full mt-3 bg-primary text-white py-1 rounded text-sm">Add to Cart</button>
            </div>
            <div className="p-4 border rounded-lg">
              <img src="https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=500&h=500&fit=crop" alt="Product" className="w-full h-48 object-cover rounded-md mb-3" />
              <h3 className="font-semibold text-sm mb-1">Professional Camera</h3>
              <p className="text-xs text-muted-foreground mb-2">4K video & 20MP</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">$799.99</p>
                  <p className="text-xs text-muted-foreground line-through">$999.99</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-xs">4.9</span>
                </div>
              </div>
              <button className="w-full mt-3 bg-primary text-white py-1 rounded text-sm">Add to Cart</button>
            </div>
            <div className="p-4 border rounded-lg">
              <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop" alt="Product" className="w-full h-48 object-cover rounded-md mb-3" />
              <h3 className="font-semibold text-sm mb-1">Leather Backpack</h3>
              <p className="text-xs text-muted-foreground mb-2">Durable travel</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">$129.99</p>
                  <p className="text-xs text-muted-foreground line-through">$179.99</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-xs">4.7</span>
                </div>
              </div>
              <button className="w-full mt-3 bg-primary text-white py-1 rounded text-sm">Add to Cart</button>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <a href="/products" className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white">View All Products</a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Shop?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse our complete collection and find exactly what you're looking for.
          </p>
          <a href="/products" className="px-6 py-2 bg-primary text-white rounded-md hover:opacity-90 inline-block">Start Shopping</a>
        </div>
      </section>
    </>
  );
}
