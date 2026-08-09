import http from 'http';
import https from 'https';

const API_HOSTS = [
  'http://localhost:4000/api/products?limit=50',
  'https://commerceflow-api.onrender.com/api/products?limit=50',
  'https://commerceflow-api-server.onrender.com/api/products?limit=50'
];

function fetchJson(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: null });
        }
      });
    }).on('error', (err) => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  console.log('=== CHECKING LIVE API PRODUCT IMAGES ===\n');

  for (const endpoint of API_HOSTS) {
    console.log(`Fetching from: ${endpoint}`);
    const res = await fetchJson(endpoint);
    console.log(`Status: ${res.status}`);
    if (res.body && res.body.products) {
      console.log(`Total Products Returned: ${res.body.products.length}`);
      let withImages = 0;
      let emptyImages = 0;
      let nullImages = 0;

      res.body.products.forEach((p, idx) => {
        if (!p.images || p.images.length === 0) {
          emptyImages++;
          if (idx < 5) console.log(`  ❌ Product [${p.name}] has EMPTY images array:`, p.images);
        } else if (!p.images[0]?.url) {
          nullImages++;
          if (idx < 5) console.log(`  ❌ Product [${p.name}] has null image URL:`, p.images[0]);
        } else {
          withImages++;
          if (idx < 3) console.log(`  ✅ Product [${p.name}] primary image URL:`, p.images[0].url);
        }
      });

      console.log(`Summary: ${withImages} valid images, ${emptyImages} empty images, ${nullImages} null URLs\n`);
    } else {
      console.log('No products array in response.\n');
    }
  }
}

run();
