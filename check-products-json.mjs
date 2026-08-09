import fetch from 'node-fetch';

async function main() {
  const urls = [
    'https://commerceflow-api-1s7i.onrender.com/api/v1/products?isFeatured=true',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/products?isBestSeller=true',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/products?isNewArrival=true',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/products',
  ];
  for (const url of urls) {
    console.log('--- URL:', url);
    const res = await fetch(url);
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body snippet:', text.substring(0, 500));
  }
}

main();
