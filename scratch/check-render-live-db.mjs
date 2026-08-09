import https from 'https';

const url = 'https://commerceflow-api-1s7i.onrender.com/api/v1/products?page=1&limit=50';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    try {
      const json = JSON.parse(data);
      const products = json.data || [];
      console.log(`Total Products Returned: ${products.length}`);
      
      let malformed = 0;
      let ok = 0;

      products.forEach((p, idx) => {
        const imgUrl = p.images?.[0]?.url;
        if (imgUrl && imgUrl.includes('}')) {
          malformed++;
          if (idx < 10) console.log(`  ❌ Still Malformed: [${p.name}] -> "${imgUrl}"`);
        } else if (imgUrl) {
          ok++;
          if (idx < 5) console.log(`  ✅ Clean URL: [${p.name}] -> "${imgUrl}"`);
        }
      });

      console.log(`\nSummary: ${ok} clean URLs, ${malformed} malformed URLs`);
    } catch (err) {
      console.error('Error parsing JSON:', err.message);
    }
  });
}).on('error', (err) => console.error('Request failed:', err));
