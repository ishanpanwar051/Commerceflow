#!/usr/bin/env node
/**
 * Generate secure secrets for environment variables
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('='.repeat(60));
console.log('Generated Secure Secrets for CommerceFlow');
console.log('='.repeat(60));
console.log('\nCopy these values to your .env file:\n');

console.log('# JWT Secrets');
console.log(`JWT_ACCESS_SECRET=${generateSecret(32)}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret(32)}`);

console.log('\n# Session Secret (if needed)');
console.log(`SESSION_SECRET=${generateSecret(32)}`);

console.log('\n# Encryption Key (if needed)');
console.log(`ENCRYPTION_KEY=${generateSecret(32)}`);

console.log('\n' + '='.repeat(60));
console.log('IMPORTANT: Never commit these secrets to version control!');
console.log('Add .env to your .gitignore file.');
console.log('='.repeat(60) + '\n');
