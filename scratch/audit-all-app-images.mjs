import fs from 'fs';
import path from 'path';
import https from 'https';

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      let finalUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // If it's an Unsplash photo ID like 'photo-1517336714731-489689fd1ca8'
        finalUrl = `https://images.unsplash.com/${url.startsWith('photo-') ? url : 'photo-' + url}?auto=format&fit=crop&w=800&q=80`;
      }
      const req = https.request(finalUrl, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        resolve({ url, status: res.statusCode });
      });
      req.on('error', () => resolve({ url, status: 500 }));
      req.setTimeout(6000, () => { req.destroy(); resolve({ url, status: 408 }); });
      req.end();
    } catch (e) {
      resolve({ url, status: 500 });
    }
  });
}

function findUrlsInFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf8');
  const urls = new Set();

  // Match https://... or photo-...
  const httpRegex = /https?:\/\/[^\s'"`,}]+/g;
  let match;
  while ((match = httpRegex.exec(text)) !== null) {
    let u = match[0];
    if (u.endsWith(')') || u.endsWith(';')) u = u.slice(0, -1);
    urls.add(u);
  }

  const unsplashRegex = /'photo-[a-zA-Z0-9-]+'/g;
  while ((match = unsplashRegex.exec(text)) !== null) {
    urls.add(match[0].replace(/'/g, ''));
  }

  return Array.from(urls);
}

async function main() {
  console.log('=== Comprehensive CommerceFlow Image Audit ===\n');

  const filesToScan = [
    'backend/prisma/user-catalog.ts',
    'backend/prisma/product-images.ts',
    'backend/prisma/seed.ts',
    'backend/prisma/seed-all-categories.ts',
    'backend/prisma/update-images.ts',
    'frontend/src/app/(customer)/categories/page.tsx',
    'frontend/src/app/(customer)/page.tsx',
    'frontend/src/components/category-card.tsx',
    'frontend/src/components/product-card.tsx'
  ];

  const allUrls = new Set();
  const fileUrlMap = {};

  for (const relPath of filesToScan) {
    const absPath = path.resolve(relPath);
    const urls = findUrlsInFile(absPath);
    fileUrlMap[relPath] = urls;
    urls.forEach(u => allUrls.add(u));
  }

  console.log(`Found ${allUrls.size} unique image references across ${filesToScan.length} files.`);
  console.log('Testing network availability for image URLs...\n');

  const urlList = Array.from(allUrls);
  const batchSize = 15;
  const results = [];

  for (let i = 0; i < urlList.length; i += batchSize) {
    const batch = urlList.slice(i, i + batchSize);
    const batchRes = await Promise.all(batch.map(checkUrl));
    results.push(...batchRes);
  }

  let okCount = 0;
  let badCount = 0;
  const badUrls = [];

  for (const r of results) {
    if (r.status >= 200 && r.status < 400) {
      okCount++;
    } else {
      badCount++;
      badUrls.push(r);
      console.log(`❌ Failed Image [${r.status}]: ${r.url}`);
    }
  }

  console.log(`\nAudit Complete: ${okCount} VALID images, ${badCount} BROKEN images.`);

  if (badCount > 0) {
    console.log('\n--- Broken Image Locations ---');
    for (const bad of badUrls) {
      for (const [file, urls] of Object.entries(fileUrlMap)) {
        if (urls.includes(bad.url)) {
          console.log(`  File: ${file} -> ${bad.url} (${bad.status})`);
        }
      }
    }
  }
}

main();
