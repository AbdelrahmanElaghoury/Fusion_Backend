// middleware/errorHandler.js

/**
 * Global Express error handler.
 * Catches any errors passed via next(err) or thrown in async controllers.
 */
function errorHandler(err, req, res, next) {
    console.error(err); // log full error for internal diagnostics
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ status: 'fail', errors: messages });
    }
  
    // Mongoose duplicate key (e.g. unique email)
    if (err.code && err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res
        .status(409)
        .json({ status: 'fail', message: `Duplicate field: "${field}" already exists.` });
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ status: 'fail', message: 'Invalid or expired authentication token.' });
    }
  
    // Fallback to generic 500
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred.';
    res.status(statusCode).json({ status: 'error', message });
  }
  
  module.exports = { errorHandler };
  