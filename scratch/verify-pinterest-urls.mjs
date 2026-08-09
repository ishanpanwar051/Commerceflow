import https from 'https';
import { USER_CATALOG } from '../backend/prisma/user-catalog.js';

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        resolve({ url, status: res.statusCode });
      });
      req.on('error', () => resolve({ url, status: 500 }));
      req.setTimeout(5000, () => { req.destroy(); resolve({ url, status: 408 }); });
      req.end();
    } catch (e) {
      resolve({ url, status: 500 });
    }
  });
}

async function main() {
  const pinUrls = [];
  for (const cat of USER_CATALOG) {
    for (const p of cat.products) {
      if (p.image.includes('pinimg.com')) {
        pinUrls.push({ name: p.name, url: p.image });
      }
    }
  }

  console.log(`Checking ${pinUrls.length} Pinterest URLs...`);
  let validCount = 0;
  let invalidCount = 0;

  const results = await Promise.all(pinUrls.map(async (item) => {
    const res = await checkUrl(item.url);
    return { ...item, status: res.status };
  }));

  for (const r of results) {
    if (r.status >= 200 && r.status < 400) {
      validCount++;
    } else {
      invalidCount++;
      console.log(`❌ Invalid URL [${r.status}]: ${r.name} -> ${r.url}`);
    }
  }

  console.log(`\nResult: ${validCount} valid HTTP 200/304 images, ${invalidCount} invalid.`);
}

main();
