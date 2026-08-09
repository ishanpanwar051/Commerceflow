import fetch from 'node-fetch';

async function verifyAll() {
  console.log('--- VERIFYING LIVE PRODUCTION BACKEND (Render) ---');

  const res = await fetch('https://commerceflow-api-1s7i.onrender.com/api/v1/products');
  const json = await res.json();
  const products = json.data;

  console.log(`\nTotal Products Returned on Page 1: ${products?.length || 0}`);

  if (Array.isArray(products) && products.length > 0) {
    console.log('\n--- SAMPLE LIVE PRODUCTION PRODUCTS ---');
    products.slice(0, 10).forEach((p, idx) => {
      console.log(`${idx + 1}. [${p.name}]`);
      console.log(`   Category: ${p.category?.name}`);
      console.log(`   Image 1: ${p.images?.[0]?.url}`);
    });
  }
}

verifyAll();
