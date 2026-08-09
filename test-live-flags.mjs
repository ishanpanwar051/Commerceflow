import fetch from 'node-fetch';

async function testFlags() {
  console.log('Testing live backend section flag counts...');
  const baseUrl = 'https://commerceflow-api-1s7i.onrender.com/api/v1';

  const sections = [
    { name: 'Featured', query: 'isFeatured=true' },
    { name: 'BestSeller', query: 'isBestSeller=true' },
    { name: 'NewArrival', query: 'isNewArrival=true' },
    { name: 'TopRated', query: 'isTopRated=true' },
  ];

  for (const s of sections) {
    try {
      const res = await fetch(`${baseUrl}/products?${s.query}`);
      const json = await res.json();
      console.log(`Section ${s.name} (${s.query}): Status ${res.status}, Count: ${json.data?.length || 0}`);
    } catch (e) {
      console.error(`Error for ${s.name}:`, e.message);
    }
  }
}

testFlags();
