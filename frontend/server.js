// Simple Express server to serve the frontend static files
// This is used when deploying to Railway as a separate service
const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Frontend server running on http://${HOST}:${PORT}`);
  console.log(`   Serving from: ${distPath}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
