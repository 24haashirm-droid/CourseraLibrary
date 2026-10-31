const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDB } = require('./db');
const { seedDB } = require('./seed');

const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const submissionsRoutes = require('./routes/submissions');
const userStatusRoutes = require('./routes/userStatus');
const extensionRoutes = require('./routes/extension');

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Render forwards the original protocol in x-forwarded-proto header
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/user-status', userStatusRoutes);
app.use('/api/extension', extensionRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CourseFinder API',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Production: Serve React Frontend static assets if built
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // SPA fallback for client-side routing (works with Express 4 and 5)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
}

// Initialize database and start server
const startServer = async () => {
  try {
    await initDB();
    await seedDB();

    app.listen(PORT, () => {
      console.log(`CourseFinder API server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
