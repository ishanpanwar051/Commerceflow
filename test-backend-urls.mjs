import fetch from 'node-fetch';

async function testLiveLogin() {
  const url = 'https://commerceflow-api-1s7i.onrender.com/api/v1/auth/login';
  console.log(`Testing POST ${url}...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'customer@example.com', password: 'Admin@123' }),
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log('Response body:', text);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testLiveLogin();
