// Simple Express server to serve the frontend static files
// This is used when deploying to Railway as a separate service
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const BACKEND_URL = process.env.BACKEND_URL;

// Proxy API requests to backend to avoid CORS/cookie issues.
// Browser calls same-origin /api/* -> this server forwards to BACKEND_URL.
if (BACKEND_URL) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      xfwd: true,
      // Preserve cookies for same-origin usage on the frontend domain
      cookieDomainRewrite: '',
      // Railway is HTTPS; backend is HTTPS
      secure: true,
    })
  );
  app.use(
    '/health',
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      xfwd: true,
      secure: true,
    })
  );
} else {
  console.warn('⚠️  BACKEND_URL is not set. /api requests will 404.');
}

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Handle client-side routing - serve index.html for all non-API routes
// Use app.use with a catch-all instead of app.get('*') for better compatibility
app.use((req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // If it's not a static file request, serve index.html for SPA routing
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Frontend server running on http://${HOST}:${PORT}`);
  console.log(`   Serving from: ${distPath}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
