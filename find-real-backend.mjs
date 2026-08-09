import fetch from 'node-fetch';

const candidates = [
  'https://commerceflow-api-1s7i.onrender.com',
  'https://commerceflow-frontend-5c7v.onrender.com',
  'https://commerceflow-backend-5c7v.onrender.com',
];

async function scan() {
  console.log('Scanning Render backend services...');
  for (const base of candidates) {
    const url = `${base}/api/v1/categories`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();
      console.log(`[${res.status}] ${url}`);
      console.log(`  Content-Type: ${contentType}`);
      if (text.startsWith('{') || text.startsWith('[')) {
        console.log('  🎯 FOUND ACTIVE API SERVER! Response snippet:', text.substring(0, 150));
      } else {
        console.log('  ❌ Returned HTML/Text snippet:', text.substring(0, 80).replace(/\n/g, ' '));
      }
    } catch (e) {
      console.log(`  ❌ Failed: ${base} -> ${e.message}`);
    }
  }
}

scan();
