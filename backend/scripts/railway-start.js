#!/usr/bin/env node

// Railway startup script that handles migrations and starts the server
const { execSync } = require('child_process');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('⚠️  WARNING: DATABASE_URL not set. Skipping migrations.');
  console.warn('   Make sure you have added a PostgreSQL database in Railway.');
  console.warn('   The server will start but database operations will fail.');
  console.log('🚀 Starting server without migrations...\n');
  execSync('npm start', { stdio: 'inherit' });
} else {
  console.log('✅ DATABASE_URL found. Running migrations...\n');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('\n✅ Migrations completed. Starting server...\n');
    execSync('npm start', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}
