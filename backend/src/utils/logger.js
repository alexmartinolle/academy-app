const winston = require('winston');
const path = require('path');

/**
 * Logger configuration
 */
class Logger {
  constructor() {
    this.createLogger();
  }

  createLogger() {
    // Define log format
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.prettyPrint()
    );

    // Define console format for development
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss'
      }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
          msg += '\n' + JSON.stringify(meta, null, 2);
        }
        return msg;
      })
    );

    // Create transports array
    const transports = [];

    // Console transport for development
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: consoleFormat,
          level: process.env.LOG_LEVEL || 'debug'
        })
      );
    }

    // File transports for production
    if (process.env.NODE_ENV === 'production') {
      // Ensure logs directory exists
      const logsDir = path.join(process.cwd(), 'logs');
      require('fs').mkdirSync(logsDir, { recursive: true });

      // Combined logs
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'combined.log'),
          format: logFormat,
          level: process.env.LOG_LEVEL || 'info',
          maxsize: 5242880, // 5MB
          maxFiles: 10
        })
      );

      // Error logs
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'error.log'),
          format: logFormat,
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 10
        })
      );

      // Access logs
      transports.push(
        new winston.transports.File({
          filename: path.join(logsDir, 'access.log'),
          format: logFormat,
          level: 'http',
          maxsize: 5242880, // 5MB
          maxFiles: 10
        })
      );
    }

    // Create logger instance
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports,
      exitOnError: false
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
        format: logFormat
      })
    );

    // Handle unhandled rejections
    this.logger.rejections.handle(
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'rejections.log'),
        format: logFormat
      })
    );
  }

  /**
   * Log request information
   */
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('Content-Length') || 0
    };

    if (res.statusCode >= 400) {
      this.logger.warn('HTTP Request', logData);
    } else {
      this.logger.http('HTTP Request', logData);
    }
  }

  /**
   * Log database query
   */
  logQuery(query, params, duration) {
    this.logger.debug('Database Query', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      params: params ? JSON.stringify(params).substring(0, 100) : null,
      duration: `${duration}ms`
    });
  }

  /**
   * Log authentication event
   */
  logAuth(event, userId, ip, userAgent) {
    this.logger.info('Authentication Event', {
      event,
      userId,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log security event
   */
  logSecurity(event, details) {
    this.logger.warn('Security Event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log business event
   */
  logBusiness(event, details) {
    this.logger.info('Business Event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance(metrics) {
    this.logger.info('Performance Metrics', {
      ...metrics,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get logger instance
   */
  getLogger() {
    return this.logger;
  }
}

// Create singleton instance
const loggerInstance = new Logger();
const logger = loggerInstance.getLogger();

// Export both the class and the instance
module.exports = {
  logger,
  Logger,
  logRequest: (...args) => loggerInstance.logRequest(...args),
  logQuery: (...args) => loggerInstance.logQuery(...args),
  logAuth: (...args) => loggerInstance.logAuth(...args),
  logSecurity: (...args) => loggerInstance.logSecurity(...args),
  logBusiness: (...args) => loggerInstance.logBusiness(...args),
  logPerformance: (...args) => loggerInstance.logPerformance(...args)
};
