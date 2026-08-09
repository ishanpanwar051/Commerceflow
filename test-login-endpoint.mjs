import fetch from 'node-fetch';

async function testLiveLogin() {
  console.log('Testing live Render backend login endpoint...');
  const start = Date.now();
  try {
    const res = await fetch('https://commerceflow-frontend-5c7v.onrender.com/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'customer@example.com', password: 'Admin@123' }),
    });
    const duration = Date.now() - start;
    const json = await res.json();
    console.log(`Status: ${res.status} (${duration}ms)`);
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testLiveLogin();
