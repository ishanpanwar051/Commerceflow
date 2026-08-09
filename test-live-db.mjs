import fetch from 'node-fetch';

async function checkLiveProducts() {
  console.log('Polling live Render backend to verify database re-seed...\n');
  const url = 'https://commerceflow-api-1s7i.onrender.com/api/v1/products?limit=20';

  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/12] Fetching live products...`);
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.data || json.items || json;

        if (Array.isArray(items) && items.length > 0) {
          const sampleNames = items.slice(0, 8).map((p) => p.name);
          console.log(`\nFound ${items.length} products on live backend! Sample titles:`);
          sampleNames.forEach((n) => console.log(` - ${n}`));

          const hasEdition1 = sampleNames.some((n) => n.includes('Edition 1'));
          if (!hasEdition1) {
            console.log('\n🎉 SUCCESS! Live Render database has auto-reseeded with curated catalog!');
            return;
          } else {
            console.log('⏳ Render is still deploying or running seed script...');
          }
        }
      } else {
        console.log(`HTTP ${res.status} (Render server building/restarting...)`);
      }
    } catch (err) {
      console.log(`Fetch error: ${err.message} (Server restarting...)`);
    }
    await new Promise((r) => setTimeout(r, 10000));
  }
}

checkLiveProducts();
