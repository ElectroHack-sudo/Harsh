const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const analyticsRoutes = require('./routes/analytics');
const socialRoutes = require('./routes/social');
const aiRoutes = require('./routes/ai');
const mediaRoutes = require('./routes/media');
const calendarRoutes = require('./routes/calendar');
const schedulerRoutes = require('./routes/scheduler');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Initialize app
const app = express();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'creatorhub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Harshad2007@1823',
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ PostgreSQL connected successfully'))
  .catch(err => console.error('❌ Database connection error:', err));

// Make pool available globally
app.set('db', pool);

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/content', authMiddleware, contentRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/social', authMiddleware, socialRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/media', authMiddleware, mediaRoutes);
app.use('/api/calendar', authMiddleware, calendarRoutes);
app.use('/api/scheduler', authMiddleware, schedulerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CreatorHub API',
    version: '1.0.0',
    description: 'Social Media Management Platform API',
    endpoints: {
      auth: '/api/auth',
      content: '/api/content',
      analytics: '/api/analytics',
      social: '/api/social',
      ai: '/api/ai',
      media: '/api/media',
      calendar: '/api/calendar',
      scheduler: '/api/scheduler'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║       🚀 CreatorHub API Server            ║
║       Running on port ${PORT}                  ║
║       Environment: ${process.env.NODE_ENV || 'development'}          ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
