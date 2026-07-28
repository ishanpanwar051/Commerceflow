// Minimal Express server to test if port is accessible
const express = require('express');

const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Test server working!' });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

const PORT = 4001;
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`Test with: curl http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
