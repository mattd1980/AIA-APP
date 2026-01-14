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
  // Try multiple possible public paths
  const possiblePublicPaths = [
    path.join(process.cwd(), 'public'), // Current working directory (backend)
    path.join(__dirname, '../public'), // From scripts -> backend -> public
    path.join(process.cwd(), '../backend/public'), // If running from repo root
  ];

  let publicPath = possiblePublicPaths[0];
  for (const p of possiblePublicPaths) {
    const parentDir = path.dirname(p);
    if (fs.existsSync(parentDir)) {
      publicPath = p;
      console.log(`✅ Using public path: ${publicPath}`);
      break;
    }
  }

  console.log(`📋 Copying frontend to ${publicPath}...`);
  console.log(`   Parent directory exists: ${fs.existsSync(path.dirname(publicPath))}`);
  
  // Remove old public directory
  if (fs.existsSync(publicPath)) {
    console.log(`   Removing existing ${publicPath}...`);
    fs.rmSync(publicPath, { recursive: true, force: true });
  }
  
  // Create public directory
  console.log(`   Creating ${publicPath}...`);
  fs.mkdirSync(publicPath, { recursive: true });
  
  if (!fs.existsSync(publicPath)) {
    console.error(`❌ Failed to create public directory at ${publicPath}`);
    process.exit(1);
  }
  console.log(`✅ Public directory created at ${publicPath}`);

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
  const finalIndexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(finalIndexPath)) {
    const files = fs.readdirSync(publicPath);
    console.log(`✅ Frontend copied successfully to ${publicPath}`);
    console.log(`   Files in public: ${files.length} items`);
    console.log(`   Sample files: ${files.slice(0, 10).join(', ')}`);
    console.log(`   Absolute path: ${path.resolve(publicPath)}`);
    
    // Also verify we can read index.html
    try {
      const stats = fs.statSync(finalIndexPath);
      console.log(`   index.html size: ${stats.size} bytes`);
    } catch (e) {
      console.error(`   Warning: Cannot stat index.html: ${e.message}`);
    }
  } else {
    console.error(`❌ Copy failed - index.html not found in ${publicPath}`);
    console.error(`   Public directory exists: ${fs.existsSync(publicPath)}`);
    if (fs.existsSync(publicPath)) {
      console.error(`   Contents of public: ${fs.readdirSync(publicPath).join(', ')}`);
    }
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Error building frontend:', error.message);
  process.exit(1);
}
