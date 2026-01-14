import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import session from 'express-session';
import passport from 'passport';
import inventoryRoutes from './routes/inventories';
import healthRoutes from './routes/health';
import reportRoutes from './routes/reports';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (must come before static files)
app.use('/api/auth', authRoutes);
app.use('/api/inventories', inventoryRoutes);
app.use('/api/inventories', reportRoutes);
app.use('/health', healthRoutes);

// Serve static files from frontend build
// Try multiple possible paths (Railway might structure things differently)
// Note: Railway with Root Directory = "backend" can't access ../frontend/dist
// So we copy frontend/dist to backend/public during build
const possiblePaths = [
  path.join(process.cwd(), 'public'), // backend/public (Railway with root dir = backend)
  path.join(__dirname, '../public'), // backend/dist/../public
  path.join(process.cwd(), '../frontend/dist'), // from backend -> repo root -> frontend/dist (local dev)
  path.join(__dirname, '../../frontend/dist'), // backend/dist -> backend -> repo root -> frontend/dist (local dev)
  path.join(__dirname, '../../../frontend/dist'), // if running from different location
  path.join(process.cwd(), 'frontend/dist'), // if frontend is in backend directory
];

// Log all paths for debugging
console.log('🔍 Searching for frontend dist directory...');
console.log(`   Current working directory: ${process.cwd()}`);
console.log(`   __dirname: ${__dirname}`);
console.log('   Checking paths:');
possiblePaths.forEach((p, i) => {
  const exists = existsSync(p);
  console.log(`   ${i + 1}. ${p} ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
  if (exists) {
    try {
      const files = require('fs').readdirSync(p);
      console.log(`      Contains ${files.length} items: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
    } catch (e) {
      console.log(`      (Cannot read directory)`);
    }
  }
});

// Find the first path that exists
const frontendDistPath = possiblePaths.find(p => existsSync(p));

if (frontendDistPath && existsSync(frontendDistPath)) {
  console.log(`✅ Frontend dist found at: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  
  // Verify index.html exists
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (existsSync(indexPath)) {
    console.log(`✅ Frontend index.html found at: ${indexPath}`);
  } else {
    console.warn(`⚠️  Frontend index.html not found at: ${indexPath}`);
  }
} else {
  console.warn(`⚠️  Frontend dist not found in any of the checked paths`);
  console.warn(`   Please ensure frontend is built during deployment`);
}

// Serve frontend for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes or auth routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Try to serve index.html if frontend dist exists
  if (frontendDistPath) {
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // Fallback: return API info if frontend not built
  res.json({ 
    message: 'AIA Backend API', 
    version: '1.0.0',
    note: 'Frontend not found. Make sure frontend is built during deployment.',
    debug: {
      cwd: process.cwd(),
      __dirname: __dirname,
      checkedPaths: possiblePaths.map(p => ({ path: p, exists: existsSync(p) }))
    }
  });
});

// Start server
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

export default app;
