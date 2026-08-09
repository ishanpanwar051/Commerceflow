import fetch from 'node-fetch';

async function verifyLive() {
  console.log('Fetching live Render products...');
  const res = await fetch('https://commerceflow-api-1s7i.onrender.com/api/v1/products?limit=50');
  const json = await res.json();
  
  const products = json.data;
  console.log(`Total Products Returned: ${products?.length || 0}`);
  
  if (Array.isArray(products) && products.length > 0) {
    console.log('\n--- LIVE PRODUCTS & THEIR CUSTOM IMAGE URLS ---');
    products.slice(0, 15).forEach((p, idx) => {
      console.log(`${idx + 1}. [${p.name}]`);
      console.log(`   Category: ${p.category?.name}`);
      console.log(`   Image 1: ${p.images?.[0]?.url}`);
    });
  }
}

verifyLive();
