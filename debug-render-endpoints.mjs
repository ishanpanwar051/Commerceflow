import fetch from 'node-fetch';

async function debugAll() {
  const endpoints = [
    'https://commerceflow-api-1s7i.onrender.com/health',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/health',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/products',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/products/featured',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/deals',
    'https://commerceflow-api-1s7i.onrender.com/api/v1/categories',
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      const json = await res.json().catch(() => null);
      console.log(`[${res.status}] ${url}`);
      if (json) {
        console.log('   Keys:', Object.keys(json));
        console.log('   Data:', JSON.stringify(json).substring(0, 200));
      }
    } catch (e) {
      console.log(`[ERR] ${url} -> ${e.message}`);
    }
  }
}

debugAll();
