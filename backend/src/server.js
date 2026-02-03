const app = require('./app');
const { logger } = require('./utils/logger');
const gracefulShutdown = require('./utils/gracefulShutdown');

/**
 * Server startup and management
 */
class Server {
  constructor() {
    this.server = null;
    this.port = process.env.PORT || 3000;
    this.host = process.env.HOST || '0.0.0.0';
  }

  /**
   * Start the server
   */
  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = app.listen(this.port, this.host, () => {
          logger.info(`Server started successfully`, {
            port: this.port,
            host: this.host,
            env: process.env.NODE_ENV,
            pid: process.pid
          });

          // Log startup information
          this.logStartupInfo();

          resolve(this.server);
        });

        // Handle server errors
        this.server.on('error', (error) => {
          logger.error('Server error:', error);
          reject(error);
        });

        // Handle client errors
        this.server.on('clientError', (error, socket) => {
          logger.warn('Client error:', error);
          socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

      } catch (error) {
        logger.error('Failed to start server:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop the server
   */
  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          logger.info('Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get server instance
   */
  getServer() {
    return this.server;
  }

  /**
   * Log startup information
   */
  logStartupInfo() {
    const startupInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      port: this.port,
      host: this.host,
      pid: process.pid
    };

    logger.info('Server startup information', startupInfo);

    // Log environment variables (without sensitive data)
    const safeEnv = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      HOST: process.env.HOST,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      LOG_LEVEL: process.env.LOG_LEVEL,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS
    };

    logger.debug('Environment configuration', safeEnv);
  }

  /**
   * Handle uncaught exceptions
   */
  handleUncaughtExceptions() {
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', { reason, promise });
      this.shutdown('UNHANDLED_REJECTION');
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      this.shutdown('SIGTERM');
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received');
      this.shutdown('SIGINT');
    });

    process.on('SIGUSR2', () => {
      logger.info('SIGUSR2 received (nodemon restart)');
      this.shutdown('SIGUSR2');
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown(signal) {
    logger.info(`Shutting down server (${signal})`);

    try {
      // Stop accepting new connections
      if (this.server) {
        this.server.close(async () => {
          logger.info('Server closed - no more connections');

          // Close database connections
          const { closeDatabase } = require('./config/database');
          await closeDatabase();

          logger.info('Graceful shutdown completed');
          process.exit(0);
        });

        // Force shutdown after timeout
        setTimeout(() => {
          logger.error('Forced shutdown due to timeout');
          process.exit(1);
        }, 10000);
      } else {
        process.exit(0);
      }
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start server if this file is run directly
if (require.main === module) {
  const server = new Server();
  
  // Handle uncaught exceptions
  server.handleUncaughtExceptions();

  // Start server
  server.start()
    .then(() => {
      logger.info('Application started successfully');
    })
    .catch((error) => {
      logger.error('Failed to start application:', error);
      process.exit(1);
    });
}

module.exports = Server;
