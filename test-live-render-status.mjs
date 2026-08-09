import fetch from 'node-fetch';

async function testApi() {
  const catRes = await fetch('https://commerceflow-api-1s7i.onrender.com/api/v1/categories');
  const catData = await catRes.json();
  console.log('Categories Count:', catData.data?.categories?.length || catData.data?.length || 0);

  const prodRes = await fetch('https://commerceflow-api-1s7i.onrender.com/api/v1/products?limit=50');
  const prodData = await prodRes.json();
  console.log('Products Count:', prodData.data?.products?.length || 0);
  console.log('Meta:', prodData.data?.meta);

  if (prodData.data?.products?.length > 0) {
    console.log('\nProducts:');
    prodData.data.products.slice(0, 10).forEach(p => {
      console.log(` - ${p.name}: ${p.images?.[0]?.url}`);
    });
  }
}

testApi();
