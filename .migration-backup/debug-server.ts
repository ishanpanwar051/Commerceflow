// Debug server startup
import { config } from './src/config';
import { logger } from './src/config/logger';

console.log('=== CommerceFlow Debug ===');
console.log('Config loaded:', {
  port: config.port,
  host: config.host,
  env: config.env,
  redis: { host: config.redis.host, port: config.redis.port },
  database: config.database.url.substring(0, 20) + '...',
});

async function testDatabase() {
  try {
    console.log('\n1. Testing database...');
    const { connectDatabase } = await import('./src/config/database');
    await connectDatabase();
    console.log('✅ Database connected');
  } catch (err: any) {
    console.error('❌ Database error:', err.message);
    throw err;
  }
}

async function testRedis() {
  try {
    console.log('\n2. Testing Redis...');
    const { connectRedis } = await import('./src/config/redis');
    await connectRedis();
    console.log('✅ Redis connected (or gracefully skipped)');
  } catch (err: any) {
    console.error('❌ Redis error:', err.message);
    throw err;
  }
}

async function startServer() {
  try {
    console.log('\n3. Starting Express server...');
    const { app } = await import('./src/app');
    
    const server = app.listen(config.port, config.host, () => {
      console.log(`✅ Server started on ${config.host}:${config.port}`);
      console.log(`   Test: curl http://localhost:${config.port}/api/v1/health`);
    });

    server.on('error', (err: any) => {
      console.error('❌ Server error:', err.message);
      process.exit(1);
    });
  } catch (err: any) {
    console.error('❌ Server start error:', err.message);
    throw err;
  }
}

async function main() {
  try {
    await testDatabase();
    await testRedis();
    await startServer();
  } catch (err) {
    console.error('\n💥 Startup failed!');
    process.exit(1);
  }
}

main();
