import https from 'https';

const url = 'https://commerceflow-api-1s7i.onrender.com/api/v1/products?limit=50';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    try {
      const json = JSON.parse(data);
      console.log('Top level keys:', Object.keys(json));
      console.log('Data keys:', json.data ? Object.keys(json.data) : 'No data object');
      if (Array.isArray(json.data)) {
        console.log(`json.data is Array of length ${json.data.length}`);
        json.data.slice(0, 10).forEach(p => {
          console.log(`\nProduct: "${p.name}" (ID: ${p.id})`);
          console.log(`  images:`, p.images);
        });
      } else if (json.data && json.data.items) {
        console.log(`json.data.items is Array of length ${json.data.items.length}`);
        json.data.items.slice(0, 10).forEach(p => {
          console.log(`\nProduct: "${p.name}" (ID: ${p.id})`);
          console.log(`  images:`, p.images);
        });
      }
    } catch (err) {
      console.log('Failed to parse JSON:', err.message);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching API:', err);
});
