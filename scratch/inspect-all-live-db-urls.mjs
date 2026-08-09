import https from 'https';

function fetchPage(page) {
  const url = `https://commerceflow-api-1s7i.onrender.com/api/v1/products?page=${page}&limit=100`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data || []);
        } catch {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

function httpCheck(targetUrl) {
  return new Promise((resolve) => {
    https.get(targetUrl, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve(500));
  });
}

async function run() {
  console.log('=== AUDITING ALL LIVE DATABASE PRODUCTS ACROSS ALL PAGES ===\n');
  let allProducts = [];

  for (let p = 1; p <= 10; p++) {
    const items = await fetchPage(p);
    if (!items.length) break;
    allProducts = allProducts.concat(items);
  }

  console.log(`Fetched ${allProducts.length} total products from live backend database.\n`);

  let malformedCount = 0;
  let failedCount = 0;
  let okCount = 0;

  for (let i = 0; i < allProducts.length; i++) {
    const p = allProducts[i];
    const imgUrl = p.images?.[0]?.url;
    if (!imgUrl) {
      console.log(`❌ Product #${i+1} [${p.name}] has NO primary image!`);
      failedCount++;
      continue;
    }

    let isMalformed = false;
    if (imgUrl.includes('}') || imgUrl.includes('{') || imgUrl.includes(' ') || !imgUrl.startsWith('http')) {
      malformedCount++;
      isMalformed = true;
      console.log(`❌ Malformed URL in DB Product #${i+1} [${p.name}]: "${imgUrl}"`);
    }

    const statusCode = await httpCheck(imgUrl);
    if (statusCode !== 200) {
      failedCount++;
      if (!isMalformed) {
        console.log(`❌ Network Failure [${statusCode}] Product #${i+1} [${p.name}]: "${imgUrl}"`);
      }
    } else {
      okCount++;
    }
  }

  console.log(`\n=== FINAL LIVE DB AUDIT SUMMARY ===`);
  console.log(`Total Products: ${allProducts.length}`);
  console.log(`✅ OK Images (HTTP 200): ${okCount}`);
  console.log(`❌ Malformed URLs: ${malformedCount}`);
  console.log(`❌ Failed Images (HTTP 404 / 500): ${failedCount}`);
}

run();
