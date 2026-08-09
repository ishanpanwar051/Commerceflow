import fetch from 'node-fetch';

async function verify() {
  const base = 'https://commerceflow-api-1s7i.onrender.com/api/v1';

  console.log('=== VERIFYING LIVE RENDER BACKEND DATABASE & ENDPOINTS ===\n');

  // 1. Health
  const healthRes = await fetch(`${base}/health`);
  console.log('1. Health check status:', healthRes.status, await healthRes.json());

  // 2. Categories
  const catRes = await fetch(`${base}/categories`);
  const catJson = await catRes.json();
  console.log(`\n2. Categories total: ${catJson.data?.length || 0}`);

  // 3. Products - All
  const prodRes = await fetch(`${base}/products?limit=100`);
  const prodJson = await prodRes.json();
  const allProds = prodJson.data || [];
  console.log(`\n3. Total products in page 1 (limit 100): ${allProds.length}`);

  // 4. Products - Featured
  const featRes = await fetch(`${base}/products?isFeatured=true&limit=50`);
  const featJson = await featRes.json();
  const featProds = featJson.data || [];
  console.log(`\n4. Featured products count: ${featProds.length}`);
  if (featProds.length > 0) {
    console.log('   Sample Featured:', featProds.slice(0, 3).map(p => ({ id: p.id, name: p.name, price: p.basePrice, images: p.images?.length })));
  }

  // 5. Products - BestSeller
  const bsRes = await fetch(`${base}/products?isBestSeller=true&limit=50`);
  const bsJson = await bsRes.json();
  const bsProds = bsJson.data || [];
  console.log(`\n5. BestSeller products count: ${bsProds.length}`);
  if (bsProds.length > 0) {
    console.log('   Sample BestSeller:', bsProds.slice(0, 3).map(p => ({ id: p.id, name: p.name, price: p.basePrice, images: p.images?.length })));
  }

  // 6. Products - NewArrival
  const naRes = await fetch(`${base}/products?isNewArrival=true&limit=50`);
  const naJson = await naRes.json();
  const naProds = naJson.data || [];
  console.log(`\n6. NewArrival products count: ${naProds.length}`);
  if (naProds.length > 0) {
    console.log('   Sample NewArrival:', naProds.slice(0, 3).map(p => ({ id: p.id, name: p.name, price: p.basePrice, images: p.images?.length })));
  }
}

verify().catch(console.error);
