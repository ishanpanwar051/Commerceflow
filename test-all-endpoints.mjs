import fetch from 'node-fetch';

const baseUrl = 'https://commerceflow-api-1s7i.onrender.com/api/v1';

async function testAll() {
  const endpoints = [
    '/categories',
    '/products',
    '/products?isFeatured=true',
    '/products?isBestSeller=true',
    '/products?isNewArrival=true',
    '/products?minDiscount=1',
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(baseUrl + ep);
      const json = await res.json();
      console.log(`=== ENDPOINT: ${ep} (Status: ${res.status}) ===`);
      if (Array.isArray(json.data)) {
        console.log(`Data count: ${json.data.length}`);
      } else if (json.data?.products) {
        console.log(`Products count: ${json.data.products.length}, Meta total: ${json.data.meta?.total}`);
      } else {
        console.log('Response body:', JSON.stringify(json).substring(0, 200));
      }
    } catch (e) {
      console.error(`Error fetching ${ep}:`, e.message);
    }
  }
}

testAll();
