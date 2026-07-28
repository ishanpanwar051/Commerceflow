// Quick backend test
const http = require('http');

console.log('Testing backend at localhost:4000...\n');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/',
  method: 'GET',
  timeout: 5000,
};

const req = http.request(options, (res) => {
  console.log(`✅ Response received! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    process.exit(0);
  });
});

req.on('timeout', () => {
  console.log('❌ Request timed out after 5 seconds');
  req.destroy();
  process.exit(1);
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
  process.exit(1);
});

req.end();
