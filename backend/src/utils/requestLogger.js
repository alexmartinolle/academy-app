const { logRequest } = require('./logger');

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to log response
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log the request
    logRequest(req, res, responseTime);
    
    // Call original end function
    originalEnd.apply(this, args);
  };

  next();
};

module.exports = requestLogger;
