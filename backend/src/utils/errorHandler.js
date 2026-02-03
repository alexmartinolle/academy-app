const logger = require('./logger');

/**
 * Centralized error handling middleware
 */
class ErrorHandler {
  /**
   * Handle database errors
   */
  static handleDatabaseError(error) {
    logger.error('Database error:', error);
    
    // PostgreSQL error codes
    switch (error.code) {
      case '23505': // Unique violation
        return {
          status: 409,
          message: 'Resource already exists',
          details: error.detail
        };
      case '23503': // Foreign key violation
        return {
          status: 400,
          message: 'Referenced resource does not exist',
          details: error.detail
        };
      case '23502': // Not null violation
        return {
          status: 400,
          message: 'Required field is missing',
          details: error.detail
        };
      case '23514': // Check violation
        return {
          status: 400,
          message: 'Data validation failed',
          details: error.detail
        };
      case '08006': // Connection failure
      case '08001': // SQL client unable to establish connection
        return {
          status: 503,
          message: 'Database service unavailable',
          details: 'Please try again later'
        };
      case '42501': // Insufficient privilege
        return {
          status: 403,
          message: 'Insufficient database privileges',
          details: error.detail
        };
      default:
        return {
          status: 500,
          message: 'Database operation failed',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        };
    }
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error) {
    logger.warn('Validation error:', error);
    
    if (error.isJoi) {
      return {
        status: 400,
        message: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      };
    }
    
    return {
      status: 400,
      message: 'Invalid input data',
      details: error.message
    };
  }

  /**
   * Handle JWT errors
   */
  static handleJWTError(error) {
    logger.warn('JWT error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return {
        status: 401,
        message: 'Invalid authentication token',
        details: 'Please login again'
      };
    }
    
    if (error.name === 'TokenExpiredError') {
      return {
        status: 401,
        message: 'Authentication token expired',
        details: 'Please refresh your token'
      };
    }
    
    if (error.name === 'NotBeforeError') {
      return {
        status: 401,
        message: 'Authentication token not active',
        details: 'Token is not yet valid'
      };
    }
    
    return {
      status: 401,
      message: 'Authentication error',
      details: error.message
    };
  }

  /**
   * Handle authorization errors
   */
  static handleAuthorizationError(error) {
    logger.warn('Authorization error:', error);
    
    return {
      status: 403,
      message: 'Access denied',
      details: error.message || 'Insufficient permissions'
    };
  }

  /**
   * Handle rate limiting errors
   */
  static handleRateLimitError(error) {
    logger.warn('Rate limit exceeded:', error);
    
    return {
      status: 429,
      message: 'Too many requests',
      details: `Rate limit exceeded. Try again in ${Math.ceil(error.resetTime / 1000)} seconds`,
      retryAfter: Math.ceil(error.resetTime / 1000)
    };
  }

  /**
   * Handle file upload errors
   */
  static handleFileUploadError(error) {
    logger.error('File upload error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return {
        status: 413,
        message: 'File too large',
        details: `Maximum file size is ${error.limit} bytes`
      };
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return {
        status: 400,
        message: 'Too many files',
        details: `Maximum ${error.limit} files allowed`
      };
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return {
        status: 400,
        message: 'Unexpected file field',
        details: `File field '${error.field}' is not allowed`
      };
    }
    
    return {
      status: 400,
      message: 'File upload failed',
      details: error.message
    };
  }

  /**
   * Handle application-specific errors
   */
  static handleApplicationError(error) {
    logger.error('Application error:', error);
    
    // Custom business logic errors
    if (error.code) {
      switch (error.code) {
        case 'STUDENT_NOT_FOUND':
          return {
            status: 404,
            message: 'Student not found',
            details: error.message
          };
        case 'PLAN_NOT_FOUND':
          return {
            status: 404,
            message: 'Plan not found',
            details: error.message
          };
        case 'PLAN_INACTIVE':
          return {
            status: 400,
            message: 'Plan is not active',
            details: error.message
          };
        case 'ACTIVE_PLAN_EXISTS':
          return {
            status: 409,
            message: 'Student already has an active plan',
            details: error.message
          };
        case 'NO_ACTIVE_PLAN':
          return {
            status: 400,
            message: 'Student has no active plan',
            details: error.message
          };
        case 'PLAN_MISMATCH':
          return {
            status: 400,
            message: 'Payment plan does not match student active plan',
            details: error.message
          };
        case 'PLAN_EXISTS':
          return {
            status: 409,
            message: 'Plan with these specifications already exists',
            details: error.message
          };
        default:
          return {
            status: 500,
            message: 'Application error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          };
      }
    }
    
    return {
      status: 500,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }

  /**
   * Main error handler - determines error type and returns appropriate response
   */
  static handleError(error) {
    // Database errors
    if (error.code && typeof error.code === 'string' && error.code.match(/^2[0-9]{4}|0[0-9]{4}|4[0-9]{4}$/)) {
      return this.handleDatabaseError(error);
    }
    
    // Validation errors
    if (error.isJoi || error.name === 'ValidationError') {
      return this.handleValidationError(error);
    }
    
    // JWT errors
    if (error.name && error.name.includes('Token') || error.name.includes('JsonWebToken')) {
      return this.handleJWTError(error);
    }
    
    // Authorization errors
    if (error.status === 403 || error.name === 'AuthorizationError') {
      return this.handleAuthorizationError(error);
    }
    
    // Rate limiting errors
    if (error.status === 429 || error.name === 'RateLimitError') {
      return this.handleRateLimitError(error);
    }
    
    // File upload errors
    if (error.code && error.code.startsWith('LIMIT_')) {
      return this.handleFileUploadError(error);
    }
    
    // Application-specific errors
    if (error.code || error.name === 'ApplicationError') {
      return this.handleApplicationError(error);
    }
    
    // Syntax errors
    if (error instanceof SyntaxError) {
      logger.error('Syntax error:', error);
      return {
        status: 400,
        message: 'Invalid request format',
        details: 'Request body contains invalid JSON or syntax'
      };
    }
    
    // Default error
    logger.error('Unhandled error:', error);
    return {
      status: 500,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }

  /**
   * Express error handling middleware
   */
  static middleware() {
    return (error, req, res, next) => {
      const errorResponse = this.handleError(error);
      
      // Log the error
      logger.error('Request error:', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: errorResponse,
        stack: error.stack
      });
      
      // Add retry-after header for rate limiting
      if (errorResponse.retryAfter) {
        res.set('Retry-After', errorResponse.retryAfter);
      }
      
      // Send error response
      res.status(errorResponse.status).json({
        success: false,
        error: {
          message: errorResponse.message,
          details: errorResponse.details,
          timestamp: new Date().toISOString(),
          path: req.url,
          method: req.method
        }
      });
    };
  }

  /**
   * Async error wrapper for routes
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandler;
