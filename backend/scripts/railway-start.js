#!/usr/bin/env node

// Railway startup script that handles migrations, builds frontend, and starts the server
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Prepare DATABASE_URL for Railway: timeouts + SSL for public URL
if (process.env.DATABASE_URL) {
  let u = process.env.DATABASE_URL;
  if (!u.includes('connect_timeout')) {
    u = u.includes('?') ? `${u}&connect_timeout=10` : `${u}?connect_timeout=10`;
  }
  // Public Railway Postgres (proxy.rlwy.net / railway.app) requires SSL
  const isPublicHost = /\.(proxy\.rlwy\.net|railway\.app)/.test(u) || u.includes('rlwy.net');
  if (isPublicHost && !u.includes('sslmode=')) {
    u = u.includes('?') ? `${u}&sslmode=require` : `${u}?sslmode=require`;
  }
  process.env.DATABASE_URL = u;
}

console.log('🚀 Railway startup script starting...');
console.log(`   Current directory: ${process.cwd()}`);
console.log(`   __dirname: ${__dirname}`);

// Build and copy frontend during startup (ensures it's available at runtime)
const backendDir = process.cwd();
const publicPath = path.join(backendDir, 'public');

console.log(`\n🔨 Building frontend during startup...`);
console.log(`   Backend directory: ${backendDir}`);
console.log(`   Target public path: ${publicPath}`);

try {
  // Find frontend directory
  const possibleFrontendPaths = [
    path.join(backendDir, '../frontend'),
    path.join(__dirname, '../../frontend'),
  ];

  let frontendPath = null;
  for (const p of possibleFrontendPaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'package.json'))) {
      frontendPath = p;
      console.log(`   ✅ Found frontend at: ${frontendPath}`);
      break;
    }
  }

  if (!frontendPath) {
    console.warn(`   ⚠️  Frontend directory not found - checking if public already exists...`);
    if (fs.existsSync(publicPath) && fs.existsSync(path.join(publicPath, 'index.html'))) {
      console.log(`   ✅ Public directory already exists with index.html - skipping build`);
    } else {
      console.error(`   ❌ Frontend directory not found and public doesn't exist!`);
      console.error(`   Checked paths: ${possibleFrontendPaths.join(', ')}`);
    }
  } else {
    // Build frontend
    console.log(`   📦 Installing frontend dependencies...`);
    execSync('npm ci', { cwd: frontendPath, stdio: 'inherit' });

    console.log(`   🏗️  Building frontend...`);
    execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });

    // Verify build
    const distPath = path.join(frontendPath, 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      console.error(`   ❌ Frontend build failed - index.html not found`);
      process.exit(1);
    }

    console.log(`   ✅ Frontend built successfully`);

    // Copy to backend/public
    console.log(`   📋 Copying frontend to ${publicPath}...`);
    
    // Remove old public directory
    if (fs.existsSync(publicPath)) {
      fs.rmSync(publicPath, { recursive: true, force: true });
    }
    
    // Create public directory
    fs.mkdirSync(publicPath, { recursive: true });

    // Copy all files
    const copyRecursive = (src, dest) => {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };

    copyRecursive(distPath, publicPath);

    // Verify copy
    if (fs.existsSync(path.join(publicPath, 'index.html'))) {
      const files = fs.readdirSync(publicPath);
      console.log(`   ✅ Frontend copied successfully to ${publicPath}`);
      console.log(`   Files in public: ${files.length} items`);
    } else {
      console.error(`   ❌ Copy failed - index.html not found in ${publicPath}`);
      process.exit(1);
    }
  }
} catch (error) {
  console.error(`   ❌ Error building/copying frontend: ${error.message}`);
  console.error(`   Stack: ${error.stack}`);
  // Don't exit - try to continue with server start in case public already exists
  console.warn(`   ⚠️  Continuing with server start...`);
}

// Final check
console.log(`\n📁 Final check for frontend...`);
if (fs.existsSync(publicPath) && fs.existsSync(path.join(publicPath, 'index.html'))) {
  const files = fs.readdirSync(publicPath);
  console.log(`   ✅ Public directory ready with ${files.length} files`);
} else {
  console.warn(`   ⚠️  Public directory not ready - server will show API message`);
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
  const maxAttempts = 3;
  const delayMs = 10_000;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('\n✅ Migrations completed. Starting server...\n');
      execSync('npm start', { stdio: 'inherit' });
      process.exit(0);
    } catch (error) {
      lastError = error;
      console.error(`❌ Migration attempt ${attempt}/${maxAttempts} failed:`, error.message);
      if (attempt < maxAttempts) {
        console.log(`   Retrying in ${delayMs / 1000}s (DB may still be starting)...`);
        const deadline = Date.now() + delayMs;
        while (Date.now() < deadline) {}
      }
    }
  }
  console.error('\n❌ All migration attempts failed. If using postgres.railway.internal, try the');
  console.error('   public DATABASE_URL from PostgreSQL → Connect in Railway dashboard.\n');
  process.exit(1);
}
