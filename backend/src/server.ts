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
const possiblePaths = [
  path.join(__dirname, '../../frontend/dist'), // backend/dist -> backend -> repo root -> frontend/dist
  path.join(__dirname, '../../../frontend/dist'), // if running from different location
  path.join(process.cwd(), '../frontend/dist'), // from current working directory
];

// Find the first path that exists
const frontendDistPath = possiblePaths.find(p => existsSync(p)) || possiblePaths[0];

// Check if frontend dist exists, log for debugging
if (existsSync(frontendDistPath)) {
  console.log(`✅ Frontend dist found at: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
} else {
  console.warn(`⚠️  Frontend dist not found at: ${frontendDistPath}`);
  console.warn(`   Current __dirname: ${__dirname}`);
}

// Serve frontend for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes or auth routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Try to serve index.html if it exists
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback: return API info if frontend not built
    res.json({ 
      message: 'AIA Backend API', 
      version: '1.0.0',
      note: 'Frontend not found. Make sure frontend is built during deployment.'
    });
  }
});

// Start server
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

export default app;
