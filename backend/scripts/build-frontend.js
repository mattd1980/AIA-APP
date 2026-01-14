#!/usr/bin/env node

// Script to build frontend and copy it to backend/public
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building frontend...');
console.log(`   Current directory: ${process.cwd()}`);
console.log(`   __dirname: ${__dirname}`);

try {
  // Try to find frontend directory
  const possibleFrontendPaths = [
    path.join(process.cwd(), '../frontend'),
    path.join(__dirname, '../../frontend'),
    path.join(process.cwd(), '../../frontend'),
  ];

  let frontendPath = null;
  for (const p of possibleFrontendPaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'package.json'))) {
      frontendPath = p;
      console.log(`✅ Found frontend at: ${frontendPath}`);
      break;
    }
  }

  if (!frontendPath) {
    console.error('❌ Frontend directory not found!');
    console.error('   Checked paths:');
    possibleFrontendPaths.forEach(p => {
      console.error(`   - ${p} (exists: ${fs.existsSync(p)})`);
    });
    process.exit(1);
  }

  // Build frontend
  console.log('📦 Installing frontend dependencies...');
  execSync('npm ci', { cwd: frontendPath, stdio: 'inherit' });

  console.log('🏗️  Building frontend...');
  execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });

  // Verify build
  const distPath = path.join(frontendPath, 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error(`❌ Frontend build failed - index.html not found at ${indexPath}`);
    process.exit(1);
  }

  console.log(`✅ Frontend built successfully at ${distPath}`);

  // Copy to backend/public
  const publicPath = path.join(process.cwd(), 'public');
  console.log(`📋 Copying frontend to ${publicPath}...`);
  
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
    console.log(`✅ Frontend copied successfully to ${publicPath}`);
    console.log(`   Files in public: ${fs.readdirSync(publicPath).length} items`);
  } else {
    console.error(`❌ Copy failed - index.html not found in ${publicPath}`);
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Error building frontend:', error.message);
  process.exit(1);
}
