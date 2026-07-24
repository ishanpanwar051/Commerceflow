import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/providers/Providers';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'CommerceFlow - Premium E-Commerce',
    template: '%s | CommerceFlow',
  },
  description: 'Your premium e-commerce destination for quality products.',
  keywords: ['e-commerce', 'shop', 'online store', 'products'],
  openGraph: {
    title: 'CommerceFlow',
    description: 'Your premium e-commerce destination for quality products.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'CommerceFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CommerceFlow',
    description: 'Your premium e-commerce destination for quality products.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
