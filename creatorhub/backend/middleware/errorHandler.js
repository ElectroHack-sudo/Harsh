/**
 * Global Error Handler Middleware
 * Imported by: server.js line 13
 * Called by: Express app.use() for global error handling
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Multer error handling (file uploads)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large. Maximum size is 500MB.'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file field in upload.'
    });
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplicate entry. This record already exists.'
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Foreign key constraint violation. Referenced record does not exist.'
    });
  }

  if (err.code === '23502') {
    return res.status(400).json({
      error: 'Required field is missing.'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid authentication token.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication token has expired.'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details || err.message
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};

module.exports = errorHandler;
