/**
 * Fills EVERY category/subcategory in the database with products.
 *
 * Unlike seed.ts (which stops at 120 products and only ever fills the first
 * few Electronics subcategories), this script iterates every leaf category in
 * the live database and creates a small batch of products for each one, so no
 * category page is ever empty.
 *
 * Usage (from repo root, pointing DATABASE_URL at the target database):
 *   $env:DATABASE_URL="<connection-string>"; pnpm dlx tsx backend/prisma/seed-all-categories.ts
 */
import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { getProductImages } from './product-images';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client') as typeof import('@prisma/client');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required to run this seed');
  process.exit(1);
}
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min: number, max: number, decimals = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// How many products to create per category that currently has none.
// Each product ships with 4 images, so 5 products = 20 images per category.
const PRODUCTS_PER_CATEGORY = 5;

const ADJECTIVES = ['Premium', 'Classic', 'Elite', 'Pro', 'Ultra', 'Essential', 'Deluxe', 'Prime', 'Signature', 'Luxe'];
const NOUNS = ['Collection', 'Series', 'Edition', 'Pack', 'Kit', 'Bundle', 'Set', 'Range', 'Line', 'Style'];

const BRANDS = [
  'Nike', 'Adidas', 'Puma', 'Levi\'s', 'H&M', 'Zara', 'Tommy Hilfiger', 'Calvin Klein',
  'Sony', 'Samsung', 'Apple', 'Bose', 'JBL', 'Philips', 'Logitech', 'Dell',
  'Prestige', 'Hawkins', 'Pigeon', 'Bajaj', 'Bosch', 'LG', 'Godrej',
  'Decathlon', 'Cosco', 'Reebok', 'Speedo', 'SG',
  'Penguin', 'HarperCollins', 'Oxford', 'Wiley',
  'L\'Oreal', 'Lakme', 'Mamaearth', 'Himalaya', 'Nivea', 'Neutrogena',
  'TP-Link', 'Anker', 'ASUS', 'Lenovo', 'HP', 'Whirlpool', 'Cello',
];

const SELLERS = ['Reliance Digital', 'Croma', 'Tata CLiQ', 'Flipkart Seller', 'Amazon India', 'Vijay Sales', 'Poorvika Mobiles', 'Bajaj Electronics'];
const RETURN_POLICIES = ['15 Days Easy Return', '30 Days Return Policy', '7 Days Replacement', 'No Questions Asked Returns within 15 Days'];
const DELIVERY_ESTIMATES = ['2-3 Business Days', '3-5 Business Days', 'Express 24 Hours', '1-2 Business Days', '4-6 Business Days'];
const WARRANTIES = ['1 Year Manufacturer Warranty', '2 Year International Warranty', '3 Year Extended Warranty', '1 Year Limited Warranty'];
const ORIGINS = ['China', 'India', 'USA', 'Japan', 'South Korea', 'Germany', 'Taiwan', 'Vietnam'];
const MATERIALS = ['Aluminum', 'Plastic', 'Stainless Steel', 'Glass', 'Leather', 'Cotton', 'Polyester', 'Wood'];
const GST = [5, 12, 18, 28];

function productName(categoryName: string, index: number): string {
  return `${pick(ADJECTIVES)} ${categoryName} ${pick(NOUNS)} ${index + 1}`;
}

async function main() {
  console.log('🌱 Filling all categories with products...');

  const allCategories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const childParentIds = new Set(allCategories.map((c) => c.parentId).filter(Boolean));
  const leafCategories = allCategories.filter(
    (c) => c.deletedAt === null && c.isActive === true && !childParentIds.has(c.id),
  );

  console.log(`Found ${leafCategories.length} leaf categories (subcategories).`);

  let created = 0;
  let skipped = 0;

  for (const category of leafCategories) {
    const existingCount = await prisma.product.count({
      where: { categoryId: category.id, deletedAt: null, isActive: true },
    });
    if (existingCount > 0) {
      skipped++;
      continue;
    }

    const parent = category.parentId
      ? allCategories.find((c) => c.id === category.parentId)?.slug || 'general'
      : 'general';

    for (let i = 0; i < PRODUCTS_PER_CATEGORY; i++) {
      const name = productName(category.name, i);
      const brand = BRANDS[(created + i) % BRANDS.length];
      const price = randomFloat(199, 49999);
      const discountPercent = randomInt(0, 45);
      const originalPrice = discountPercent > 0
        ? parseFloat((price / (1 - discountPercent / 100)).toFixed(0))
        : price;
      const stock = randomInt(5, 200);
      const soldCount = randomInt(100, 30000);
      const avgRating = randomFloat(3.5, 5.0);
      const trendingScore = randomFloat(1, 100);
      const isFeatured = Math.random() > 0.85;
      const isBestSeller = soldCount > 8000 && Math.random() > 0.5;
      const isNewArrival = Math.random() > 0.6;
      const uniqueId = `${created}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const slug = slugify(`${name}-${brand}-${uniqueId}`);
      const sku = `${brand.substring(0, 3).toUpperCase()}-${String(created + 1000).padStart(5, '0')}-${Math.random().toString(36).substring(2, 6)}`;
      const description = `The ${name} by ${brand} delivers exceptional ${category.name.toLowerCase()} performance with cutting-edge technology and premium design. Perfect for everyday use.`;
      const images = getProductImages({ name, brand, categorySlug: parent, subcategory: category.name }, created);

      await prisma.product.create({
        data: {
          name,
          slug,
          description,
          longDescription: description + ' ' + `Backed by ${pick(WARRANTIES)} and reliable customer support. Buy with confidence from ${pick(SELLERS)} with easy returns and fast delivery across India.`,
          basePrice: Math.round(price * 100),
          originalPrice: Math.round(originalPrice * 100),
          discountPercent,
          brand,
          sku,
          barcode: String(randomInt(100000000000, 999999999999)),
          categoryId: category.id,
          weight: randomFloat(0.2, 8.0),
          dimensions: `${randomInt(10, 80)} x ${randomInt(10, 80)} x ${randomInt(2, 40)} cm`,
          material: pick(MATERIALS),
          warranty: pick(WARRANTIES),
          countryOfOrigin: pick(ORIGINS),
          sellerName: pick(SELLERS),
          returnPolicy: pick(RETURN_POLICIES),
          deliveryEstimate: pick(DELIVERY_ESTIMATES),
          gstPercent: pick(GST),
          cashOnDelivery: Math.random() > 0.3,
          emiAvailable: Math.random() > 0.4,
          freeDelivery: Math.random() > 0.3,
          specifications: { 'Feature': 'Standard', 'Compatibility': 'Universal' },
          keyFeatures: [`Premium ${category.name.toLowerCase()}`, 'High quality materials', 'Easy to use', 'Great value for money'],
          whatsInTheBox: [`1x ${name}`, '1x User Manual', '1x Warranty Card'],
          tags: [category.slug, parent, ...(isFeatured ? ['featured'] : []), ...(isBestSeller ? ['best-seller'] : []), ...(isNewArrival ? ['new-arrival'] : [])],
          isFeatured,
          isNewArrival,
          isBestSeller,
          isTopRated: avgRating > 4.5,
          soldCount,
          wishlistCount: randomInt(100, 5000),
          questionsCount: randomInt(5, 100),
          trendingScore,
          seoMetaTitle: `${name} - ${brand} ${category.name} | CommerceFlow`,
          seoDescription: `Buy ${name} by ${brand} at best price. ${description.substring(0, 100)}`,
          seoKeywords: `${name}, ${brand}, ${category.name}, buy online, best price, India`,
          images: { create: images },
          inventory: { create: { stock, reservedStock: 0, lowStockThreshold: 5 } },
        },
      });

      created++;
    }
    console.log(`  ✓ ${category.name} (${parent}) → ${PRODUCTS_PER_CATEGORY} products`);
  }

  console.log(`\n✅ Done! Created: ${created}, Skipped (already has products): ${skipped}`);
  console.log(`   Total products now: ${await prisma.product.count({ where: { deletedAt: null } })}`);
}

main()
  .then(async () => { await prisma.$disconnect(); await pool.end(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
    process.exit(1);
  });
