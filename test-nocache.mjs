import fetch from 'node-fetch';

async function testNoCache() {
  const ts = Date.now();
  console.log(`Fetching products with cache-busting query timestamp=${ts}...`);
  const res = await fetch(`https://commerceflow-api-1s7i.onrender.com/api/v1/products?limit=50&_t=${ts}`);
  const data = await res.json();
  
  console.log('API Status:', res.status);
  console.log('Success:', data.success);
  console.log('Products Count:', data.data?.products?.length || 0);
  console.log('Pagination Total:', data.data?.pagination?.total || data.data?.meta?.total);

  if (data.data?.products?.length > 0) {
    console.log('\n--- Sample Products & Images ---');
    data.data.products.slice(0, 5).forEach(p => {
      console.log(`• ${p.name}`);
      console.log(`   Image: ${p.images?.[0]?.url}`);
    });
  }
}

testNoCache();
