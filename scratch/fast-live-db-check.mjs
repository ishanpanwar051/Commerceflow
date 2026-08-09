import https from 'https';

function fetchJson(page) {
  return new Promise((resolve) => {
    https.get(`https://commerceflow-api-1s7i.onrender.com/api/v1/products?page=${page}&limit=100`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).data || []);
        } catch {
          resolve([]);
        }
      });
    });
  });
}

async function run() {
  const p1 = await fetchJson(1);
  const p2 = await fetchJson(2);
  const total = [...p1, ...p2];
  
  let malformed = 0;
  total.forEach(p => {
    const url = p.images?.[0]?.url;
    if (url && url.includes('}')) malformed++;
  });

  console.log(`Live DB Audit Result: ${total.length} products checked, ${malformed} malformed URLs.`);
}

run();
