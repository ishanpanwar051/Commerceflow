import fetch from 'node-fetch';

async function checkSiteHealth() {
  console.log('Checking live frontend deployment status...\n');
  const urls = [
    'https://commerceflow-frontend-5c7v.onrender.com/',
    'https://commerceflow-frontend-5c7v.onrender.com/new-arrivals',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/products?limit=5'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`[${res.status}] ${url}`);
    } catch (e) {
      console.log(`[ERR] ${url} - ${e.message}`);
    }
  }
}

checkSiteHealth();
