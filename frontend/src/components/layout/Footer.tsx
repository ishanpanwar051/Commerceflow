
import { Link } from 'wouter';
import { Mail, Phone, MapPin } from 'lucide-react';
import { memo } from 'react';

const shopLinks = [
  { href: '/products', label: 'All Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/deals', label: 'Deals' },
  { href: '/bestsellers', label: 'Bestsellers' },
  { href: '/new-arrivals', label: 'New Arrivals' },
];

const accountLinks = [
  { href: '/profile', label: 'My Profile' },
  { href: '/orders', label: 'My Orders' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/cart', label: 'Cart' },
  { href: '/track-order', label: 'Track Order' },
];

const supportLinks = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About Us' },
];

const policyLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
];

function FooterComponent() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-lg mb-3">CommerceFlow</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Your premium destination for quality products. Shop with confidence.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" /> support@commerceflow.com</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" /> +91 1800-123-4567</div>
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /> Gurugram, Haryana</div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Shop</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {shopLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block hover:text-foreground transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {accountLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block hover:text-foreground transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {supportLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block hover:text-foreground transition-colors">{link.label}</Link>
              ))}
              {policyLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block hover:text-foreground transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Stay Updated</h4>
            <p className="text-xs text-muted-foreground mb-3">Get the latest deals and updates.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 rounded-md border border-input bg-background px-3 py-2 text-xs"
              />
              <button type="submit" className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-xs font-medium hover:bg-primary/90 transition-colors shrink-0">
                Subscribe
              </button>
            </form>
            <div className="flex gap-3 mt-4">
              {['Twitter', 'Instagram', 'Facebook', 'YouTube'].map((social) => (
                <a key={social} href="#" onClick={(e) => e.preventDefault()} className="text-xs text-muted-foreground hover:text-foreground transition-colors" aria-label={social}>
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CommerceFlow. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const Footer = memo(FooterComponent);
