import fetch from 'node-fetch';

const targets = [
  'https://commerceflow-api-1s7i.onrender.com',
  'https://commerceflow-api.onrender.com',
  'https://commerceflow-backend.onrender.com',
  'https://commerceflow-backend-5c7v.onrender.com',
];

const paths = ['/api/healthz', '/health', '/api/v1/health', '/'];

async function probe() {
  console.log('Probing live Render backend services...');
  for (const target of targets) {
    for (const p of paths) {
      const url = target + p;
      try {
        const res = await fetch(url, { redirect: 'manual' });
        const type = res.headers.get('content-type') || '';
        console.log(`[${res.status}] ${url} (${type})`);
        if (res.status === 200 && type.includes('json')) {
          const body = await res.json();
          console.log('   ✅ LIVE BACKEND CONFIRMED:', url, body);
        }
      } catch (e) {
        // quiet
      }
    }
  }
}

probe();
