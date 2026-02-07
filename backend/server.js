const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const taskRoutes = require('./routes/tasks');

// ============================================
// INITIALIZE EXPRESS APP
// ============================================
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

/**
 * CORS Middleware
 * Enables Cross-Origin Resource Sharing
 * Allows frontend (different origin) to make requests to this backend
 * 
 * In production: Specify exact frontend URL instead of '*'
 * Example: cors({ origin: 'https://yourdomain.com' })
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',  // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * JSON Parser Middleware
 * Automatically parses incoming request bodies with JSON content-type
 * Converts JSON strings to JavaScript objects
 * 
 * Limit: 10mb (prevents large payload attacks)
 */
app.use(express.json({ limit: '10mb' }));

/**
 * URL Encoded Parser Middleware
 * Handles form data submissions (application/x-www-form-urlencoded)
 */
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * Request Logging Middleware
 * Logs incoming requests for debugging and monitoring
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES (Placeholder - to be implemented)
// ============================================

/**
 * Health Check Endpoint
 * Used to verify server is running
 * Useful for load balancers and monitoring systems
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * API Routes
 * Task CRUD endpoints defined in ./routes/tasks.js
 */
app.use('/api/tasks', taskRoutes);

// ============================================
// 404 NOT FOUND HANDLER
// ============================================
/**
 * Handles requests to routes that don't exist
 * Should be placed after all other routes
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ============================================
// GLOBAL ERROR HANDLING MIDDLEWARE
// ============================================
/**
 * Catches all errors thrown in async route handlers
 * Must be the last middleware in the chain
 * Syntax: errorHandler(err, req, res, next) - 4 parameters required
 */
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  Task Management API Server Started    ║
  ╠════════════════════════════════════════╣
  ║  Server: http://localhost:${PORT}${' '.repeat(14)}║
  ║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(26)}║
  ║  Status: ✓ Ready to accept requests    ║
  ╚════════════════════════════════════════╝
  `);
});

// ============================================
// GRACEFUL SHUTDOWN HANDLING
// ============================================
/**
 * Listens for termination signals (Ctrl+C, SIGTERM from container, etc.)
 * Closes server gracefully without abruptly terminating connections
 * Important for production deployments
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
