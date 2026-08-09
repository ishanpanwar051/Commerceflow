import fetch from 'node-fetch';

async function checkLiveAPI() {
  console.log('Fetching live Render API products...');
  try {
    const res = await fetch('https://commerceflow-api-1s7i.onrender.com/api/v1/products?limit=20');
    console.log(`API Status: ${res.status}`);
    const data = await res.json();
    console.log(`Total Products Returned: ${data.data?.products?.length || 0}`);
    
    if (data.data?.products?.length > 0) {
      console.log('\n--- Sample Products & Live Image URLs ---');
      for (const p of data.data.products.slice(0, 8)) {
        console.log(`Product: "${p.name}"`);
        console.log(`  -> Main Image: ${p.images?.[0]?.url}`);
      }
    }
  } catch (err) {
    console.error('Error fetching live API:', err.message);
  }
}

checkLiveAPI();
