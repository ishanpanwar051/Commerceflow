import fetch from 'node-fetch';

async function testCors() {
  const url = 'https://commerceflow-api-1s7i.onrender.com/api/v1/auth/login';
  console.log(`Testing OPTIONS (CORS preflight) for ${url}...`);
  try {
    const res = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://commerceflow-frontend-5c7v.onrender.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    console.log(`Status: ${res.status}`);
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
    console.log('Access-Control-Allow-Methods:', res.headers.get('access-control-allow-methods'));
    console.log('Access-Control-Allow-Headers:', res.headers.get('access-control-allow-headers'));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testCors();
