#!/usr/bin/env node

// Railway startup script that handles migrations and starts the server
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Railway startup script starting...');
console.log(`   Current directory: ${process.cwd()}`);
console.log(`   __dirname: ${__dirname}`);

// Check if public directory exists
const publicPath = path.join(process.cwd(), 'public');
console.log(`\n📁 Checking for frontend build...`);
console.log(`   Public path: ${publicPath}`);
console.log(`   Exists: ${fs.existsSync(publicPath)}`);

if (fs.existsSync(publicPath)) {
  const files = fs.readdirSync(publicPath);
  console.log(`   ✅ Public directory found with ${files.length} files`);
  if (fs.existsSync(path.join(publicPath, 'index.html'))) {
    console.log(`   ✅ index.html found`);
  } else {
    console.warn(`   ⚠️  index.html NOT found in public directory`);
  }
} else {
  console.warn(`   ⚠️  Public directory NOT found at ${publicPath}`);
  console.warn(`   This means the frontend build step may have failed.`);
  console.warn(`   Listing current directory contents:`);
  try {
    const files = fs.readdirSync(process.cwd());
    console.warn(`   ${files.join(', ')}`);
  } catch (e) {
    console.warn(`   Cannot list directory: ${e.message}`);
  }
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('\n⚠️  WARNING: DATABASE_URL not set. Skipping migrations.');
  console.warn('   Make sure you have added a PostgreSQL database in Railway.');
  console.warn('   The server will start but database operations will fail.');
  console.log('🚀 Starting server without migrations...\n');
  execSync('npm start', { stdio: 'inherit' });
} else {
  console.log('\n✅ DATABASE_URL found. Running migrations...\n');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('\n✅ Migrations completed. Starting server...\n');
    execSync('npm start', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}
