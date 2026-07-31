// Absolute minimal Express server
const express = require('express');
const app = express();

console.log('Starting minimal server...');

app.get('/', (req, res) => {
  console.log('Request received:', req.method, req.url);
  res.json({ message: 'Minimal server works!', timestamp: Date.now() });
});

app.get('/api/v1/health', (req, res) => {
  console.log('Health check:', req.method, req.url);
  res.json({ status: 'healthy' });
});

const PORT = 4000;
const HOST = '127.0.0.1';

console.log(`Attempting to listen on ${HOST}:${PORT}...`);

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log('Try: node test-backend.js');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
