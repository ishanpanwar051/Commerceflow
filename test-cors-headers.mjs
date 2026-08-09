import fetch from 'node-fetch';

async function main() {
  const origin = 'https://commerceflow-frontend-5c7v.onrender.com';
  const urls = [
    'https://commerceflow-api-1s7i.onrender.com/api/v1/products?isFeatured=true&limit=8',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/products?isBestSeller=true&limit=8',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/products?isNewArrival=true&limit=8',
  ];

  for (const url of urls) {
    console.log('Testing URL:', url);
    const res = await fetch(url, {
      headers: {
        'Origin': origin,
        'Accept': 'application/json',
      }
    });
    console.log('Status:', res.status);
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
    const json = await res.json();
    console.log('Products count returned:', json.data?.length);
    if (json.data && json.data.length > 0) {
      console.log('First product:', json.data[0].name, 'isFeatured:', json.data[0].isFeatured, 'isBestSeller:', json.data[0].isBestSeller);
    }
  }
}

main();
