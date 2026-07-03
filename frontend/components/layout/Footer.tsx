import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50 text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                CF
              </div>
              <span className="text-xl font-bold">Commerceflow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted platform for premium products and seamless shopping experience.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <nav className="space-y-2">
              <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition">
                All Products
              </Link>
              <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition">
                Categories
              </Link>
              <Link href="/deals" className="text-sm text-muted-foreground hover:text-foreground transition">
                Deals & Offers
              </Link>
              <Link href="/new" className="text-sm text-muted-foreground hover:text-foreground transition">
                New Arrivals
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <nav className="space-y-2">
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition">
                Contact Us
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition">
                FAQ
              </Link>
              <Link href="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition">
                Shipping Info
              </Link>
              <Link href="/returns" className="text-sm text-muted-foreground hover:text-foreground transition">
                Returns & Refunds
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <nav className="space-y-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition">
                About Us
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition">
                Terms of Service
              </Link>
              <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition">
                Careers
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Commerceflow. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-0.5 7-0.5z" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              <span className="sr-only">Facebook</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 012-2h3z" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition">
              <span className="sr-only">Instagram</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8A4 4 0 0116 11.37z" fill="currentColor" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
