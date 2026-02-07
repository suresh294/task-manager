// Error Handling Middleware
// Usage: Add this middleware AFTER all other middleware and routes
// app.use(errorHandler);

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry error',
      error: 'This record already exists'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record not found',
      error: err.message
    });
  }

  // Generic database errors
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }

  // Validation errors
  if (err.statusCode === 400) {
    return res.status(400).json({
      success: false,
      message: err.message,
      error: err.details || null
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};

module.exports = errorHandler;
