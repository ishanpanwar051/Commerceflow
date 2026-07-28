#!/usr/bin/env node
/**
 * Database Setup Script
 * Helps initialize the database based on DATABASE_URL
 * Usage: node scripts/db-setup.js [sqlite|postgres]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dbType = process.argv[2] || detectDatabaseType();

function detectDatabaseType() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (match) {
      const url = match[1];
      if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
        return 'postgres';
      }
      if (url.startsWith('file:') || url.includes('.db')) {
        return 'sqlite';
      }
    }
  }
  return 'sqlite'; // default
}

function run(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed`);
    process.exit(1);
  }
}

console.log('='.repeat(60));
console.log(`CommerceFlow Database Setup (${dbType.toUpperCase()})`);
console.log('='.repeat(60));

if (dbType === 'sqlite') {
  console.log('\n🔷 Using SQLite (Development Mode)');
  console.log('Schema: prisma/schema.sqlite.prisma\n');
  
  // Copy SQLite schema to main schema
  const sqliteSchema = path.join(__dirname, '../prisma/schema.sqlite.prisma');
  const mainSchema = path.join(__dirname, '../prisma/schema.prisma');
  
  if (fs.existsSync(sqliteSchema)) {
    fs.copyFileSync(sqliteSchema, mainSchema);
    console.log('✅ SQLite schema activated');
  }
  
  run('npx prisma generate', 'Generate Prisma Client');
  run('npx prisma db push', 'Push schema to database');
  
  console.log('\n💡 To seed the database, run: npm run db:seed');
  
} else if (dbType === 'postgres') {
  console.log('\n🐘 Using PostgreSQL (Production Mode)');
  console.log('Schema: prisma/schema.prisma\n');
  
  // Ensure PostgreSQL schema is in place
  const postgresSchema = path.join(__dirname, '../prisma/schema.postgres.prisma');
  const mainSchema = path.join(__dirname, '../prisma/schema.prisma');
  
  if (fs.existsSync(postgresSchema)) {
    fs.copyFileSync(postgresSchema, mainSchema);
    console.log('✅ PostgreSQL schema activated');
  }
  
  run('npx prisma generate', 'Generate Prisma Client');
  
  // Check if migrations exist
  const migrationsDir = path.join(__dirname, '../prisma/migrations');
  if (fs.existsSync(migrationsDir) && fs.readdirSync(migrationsDir).length > 0) {
    run('npx prisma migrate deploy', 'Deploy existing migrations');
  } else {
    console.log('\n⚠️  No migrations found. Creating initial migration...');
    run('npx prisma migrate dev --name init', 'Create initial migration');
  }
  
  console.log('\n💡 To seed the database, run: npm run db:seed');
  
} else {
  console.error(`\n❌ Unknown database type: ${dbType}`);
  console.error('Usage: node scripts/db-setup.js [sqlite|postgres]');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('✨ Database setup complete!');
console.log('='.repeat(60));
