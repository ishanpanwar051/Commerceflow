import fetch from 'node-fetch';

async function main() {
  const baseUrl = 'https://commerceflow-api-1s7i.onrender.com/api/v1/products';
  const queries = [
    { name: 'Featured (Home)', url: `${baseUrl}?isFeatured=true&limit=8` },
    { name: 'Bestsellers (Home)', url: `${baseUrl}?isBestSeller=true&limit=8` },
    { name: 'New Arrivals (Home)', url: `${baseUrl}?isNewArrival=true&limit=8` },
    { name: 'Deals Page', url: `${baseUrl}?page=1&limit=20&sort=discountPercent&order=desc` },
    { name: 'Bestsellers Page', url: `${baseUrl}?page=1&limit=20&isBestSeller=true` },
    { name: 'New Arrivals Page', url: `${baseUrl}?page=1&limit=20&isNewArrival=true` },
    { name: 'All Products (default)', url: `${baseUrl}` },
  ];

  for (const q of queries) {
    try {
      const res = await fetch(q.url);
      const data = await res.json();
      console.log(`[${res.status}] ${q.name}: count = ${data.data?.length ?? 0}`);
    } catch (e) {
      console.error(`Error on ${q.name}:`, e.message);
    }
  }
}

main();
