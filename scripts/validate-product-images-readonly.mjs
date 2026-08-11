import { createRequire } from 'module';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client');

async function validateImages() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('⚠️ DATABASE_URL environment variable is required to run the read-only image validator.');
    process.exit(0);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: { select: { name: true, slug: true } },
        images: { select: { id: true, url: true, order: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`\n==================================================`);
    console.log(`🔍 READ-ONLY PRODUCT IMAGE VALIDATION REPORT`);
    console.log(`==================================================`);
    console.log(`Total Products: ${products.length}\n`);

    let missingImages = 0;
    let unsplashCount = 0;
    let pinterestCount = 0;
    let otherCount = 0;
    let suspiciousCount = 0;

    const urlMap = new Map();

    for (const p of products) {
      const primaryImage = p.images && p.images.length > 0 ? p.images[0].url : null;

      if (!primaryImage) {
        missingImages++;
        console.log(`❌ [MISSING IMAGE] Product ID: ${p.id} | Name: ${p.name} | Category: ${p.category?.name}`);
        continue;
      }

      if (urlMap.has(primaryImage)) {
        urlMap.get(primaryImage).push(p.name);
      } else {
        urlMap.set(primaryImage, [p.name]);
      }

      let source = 'Other';
      if (primaryImage.includes('i.pinimg.com')) {
        pinterestCount++;
        source = 'Pinterest (Custom)';
      } else if (primaryImage.includes('images.unsplash.com')) {
        unsplashCount++;
        source = 'Unsplash';
      } else {
        otherCount++;
      }

      if (primaryImage.includes('picsum.photos')) {
        suspiciousCount++;
        console.log(`⚠️ [SUSPICIOUS IMAGE] Product ID: ${p.id} | Name: ${p.name} | URL: ${primaryImage}`);
      }
    }

    const duplicates = Array.from(urlMap.entries()).filter(([_, names]) => names.length > 1);

    console.log(`\n--------------------------------------------------`);
    console.log(`📊 SUMMARY METRICS:`);
    console.log(`- Pinterest (Custom Persistent): ${pinterestCount}`);
    console.log(`- Unsplash (Verified Catalog):   ${unsplashCount}`);
    console.log(`- Other Image Sources:          ${otherCount}`);
    console.log(`- Missing Images:               ${missingImages}`);
    console.log(`- Suspicious (Picsum) Images:   ${suspiciousCount}`);
    console.log(`- Unique Image URLs:            ${urlMap.size}`);
    console.log(`- Shared Image URLs:            ${duplicates.length}`);
    console.log(`--------------------------------------------------\n`);

  } catch (err) {
    console.error('Error running validation:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

validateImages();
