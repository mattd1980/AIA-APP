import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import inventoryRoutes from './routes/inventories';
import healthRoutes from './routes/health';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (must come before static files)
app.use('/api/inventories', inventoryRoutes);
app.use('/api/inventories', reportRoutes);
app.use('/health', healthRoutes);

// Serve static files from frontend build
// In Railway, backend is the root, so frontend is one level up
const frontendDistPath = path.join(__dirname, '../../../frontend/dist');
app.use(express.static(frontendDistPath));

// Serve frontend for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start server
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

export default app;
