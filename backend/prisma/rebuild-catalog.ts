/**
 * One-time catalog rebuild for an EXISTING database.
 *
 * - Hard-deletes all catalog rows (dependent tables first) so no stale or
 *   duplicate images survive.
 * - Recreates the 4 parent groups -> 15 subcategories -> 240 products, each
 *   with 1 unique image from its subcategory's verified Unsplash pool.
 *
 * Usage (point DATABASE_URL at the target database):
 *   $env:DATABASE_URL="<connection-string>"; pnpm dlx tsx backend/prisma/rebuild-catalog.ts
 */
import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { USER_CATALOG } from './user-catalog';
import { getProductImages, getCategoryImage } from './product-images';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client') as typeof import('@prisma/client');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}
const useSsl = !/localhost|127\.0\.0\.1/.test(new URL(databaseUrl).hostname);
const pool = new Pool({ connectionString: databaseUrl, ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}) });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min: number, max: number, decimals = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

const BRANDS = ['Samsung', 'Apple', 'Google', 'Sony', 'Bose', 'Sennheiser', 'Nike', 'Adidas', 'Puma', 'H&M', 'Zara', 'Fossil', 'Boat', 'Noise', 'LG', 'Philips', 'Prestige', 'Hawkins', 'Duroflex', 'Wakefit'];
const SELLERS = ['Reliance Digital', 'Croma', 'Tata CLiQ', 'Flipkart Seller', 'Amazon India', 'Vijay Sales', 'Poorvika Mobiles', 'Bajaj Electronics'];
const ORIGINS = ['China', 'India', 'USA', 'Japan', 'South Korea', 'Germany', 'Taiwan', 'Vietnam'];
const MATERIALS = ['Aluminum', 'Plastic', 'Stainless Steel', 'Glass', 'Leather', 'Cotton', 'Polyester', 'Wood'];
const GST = [5, 12, 18, 28];

function deriveBrand(name: string): string {
  const lower = name.toLowerCase();
  for (const b of BRANDS) if (lower.includes(b.toLowerCase())) return b;
  return 'Generic';
}

function derivePrice(name: string): number {
  const lower = name.toLowerCase();
  const rules: Array<[string, number, number]> = [
    ['macbook', 90000, 260000], ['laptop', 35000, 200000], ['iphone', 55000, 165000], ['samsung galaxy', 30000, 160000],
    ['pixel', 30000, 95000], ['smartwatch', 3000, 35000], ['garmin', 18000, 60000], ['watch', 2000, 25000],
    ['headphone', 2000, 35000], ['airpods', 25000, 50000], ['sofa', 8000, 90000], ['bed', 6000, 60000],
    ['sneaker', 2000, 15000], ['shoe', 1500, 15000], ['dress', 800, 6000], ['saree', 900, 12000],
    ['dumbbell', 1500, 8000], ['protein', 1200, 4000], ['drone', 3000, 15000], ['mat', 500, 3000],
  ];
  for (const [k, min, max] of rules) if (lower.includes(k)) return randomFloat(min, max);
  return randomFloat(299, 14999);
}

function buildDescription(name: string, brand: string, subcategory: string): string {
  return pick([
    `The ${name} by ${brand} delivers exceptional ${subcategory} performance with premium design. Perfect for everyday use.`,
    `${name} by ${brand} combines style, power and reliability in one complete package.`,
    `Discover the ${name} by ${brand} - where innovation meets craftsmanship.`,
  ]);
}

async function main() {
  // 1. Remove stale catalog data (dependency-safe order).
  await prisma.productImage.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.idempotencyRecord.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log('  Cleared old categories, products and images');

  // 2. Create 4 parents -> 15 subcategories.
  const subCatIds = new Map<string, string>();
  for (const cat of USER_CATALOG) {
    const parent = await prisma.category.create({
      data: { name: cat.name, slug: cat.slug, description: cat.description, image: getCategoryImage(cat.slug) },
    });
    for (const subcat of cat.subcategories) {
      const child = await prisma.category.create({
        data: {
          name: subcat.name,
          slug: subcat.slug,
          description: subcat.description,
          image: getCategoryImage(subcat.slug),
          parentId: parent.id,
        },
      });
      subCatIds.set(subcat.slug, child.id);
    }
  }
  console.log('  Created 4 parent groups + 15 subcategories');

  // 3. Create 240 products (1 unique image each).
  let productIndex = 0;
  for (const cat of USER_CATALOG) {
    for (const subcat of cat.subcategories) {
      const categoryId = subCatIds.get(subcat.slug)!;
      for (const cp of subcat.products) {
        const brand = deriveBrand(cp.name);
        const price = derivePrice(cp.name);
        const uniqueId = `${productIndex}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const slug = slugify(cp.name + '-' + brand + '-' + uniqueId);
        const sku = `${brand.substring(0, 3).toUpperCase()}-${String(productIndex + 1000).padStart(5, '0')}-${Math.random().toString(36).substring(2, 6)}`;
        const discountPercent = randomInt(5, 50);
        const originalPrice = parseFloat((price / (1 - discountPercent / 100)).toFixed(0));
        const images = getProductImages({ name: cp.name, brand, categorySlug: subcat.slug, subcategory: subcat.name });

        await prisma.product.create({
          data: {
            name: cp.name,
            slug,
            description: buildDescription(cp.name, brand, subcat.name),
            longDescription: `${buildDescription(cp.name, brand, subcat.name)} Buy now with easy returns and fast delivery.`,
            basePrice: Math.round(price * 100),
            originalPrice: Math.round(originalPrice * 100),
            discountPercent,
            brand,
            sku,
            barcode: String(randomInt(100000000000, 999999999999)),
            categoryId,
            weight: randomFloat(0.2, 5.0),
            dimensions: `${randomInt(10, 50)} x ${randomInt(10, 50)} x ${randomInt(2, 20)} cm`,
            material: pick(MATERIALS),
            countryOfOrigin: pick(ORIGINS),
            sellerName: pick(SELLERS),
            returnPolicy: pick(['15 Days Easy Return', '30 Days Return Policy', '7 Days Replacement']),
            deliveryEstimate: pick(['2-3 Business Days', '3-5 Business Days', '1-2 Business Days']),
            gstPercent: pick(GST),
            cashOnDelivery: true,
            emiAvailable: true,
            freeDelivery: true,
            tags: [subcat.slug, brand],
            isFeatured: productIndex < 20,
            soldCount: randomInt(100, 50000),
            trendingScore: randomFloat(1, 100),
            averageRating: randomFloat(3.5, 5.0),
            reviewCount: randomInt(50, 2500),
            seoMetaTitle: `${cp.name} - ${brand} | CommerceFlow`,
            seoDescription: `Buy ${cp.name} by ${brand} at best price online.`,
            seoKeywords: `${cp.name}, ${brand}, buy online, best price`,
            images: { create: images },
            inventory: { create: { stock: randomInt(10, 500), reservedStock: randomInt(0, 10), lowStockThreshold: 5 } },
          },
        });
        productIndex++;
      }
    }
  }

  const totalImages = await prisma.productImage.count();
  const distinctImages = await prisma.productImage.groupBy({ by: ['url'], _count: { url: true } });
  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const totalSubcats = await prisma.category.count({ where: { parentId: { not: null } } });

  console.log(`\n✅ Catalog rebuilt:`);
  console.log(`  Categories: ${totalCategories} (${totalSubcats} subcategories)`);
  console.log(`  Products: ${totalProducts}`);
  console.log(`  Images: ${totalImages} rows, ${distinctImages.length} DISTINCT urls`);
}

main()
  .then(async () => { await prisma.$disconnect(); await pool.end(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
    process.exit(1);
  });
