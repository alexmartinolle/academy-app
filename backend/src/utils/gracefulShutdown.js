const { logger } = require('./logger');

/**
 * Graceful shutdown utilities
 */
class GracefulShutdown {
  constructor() {
    this.isShuttingDown = false;
    this.activeConnections = new Set();
    this.shutdownTimeout = 10000; // 10 seconds
  }

  /**
   * Register active connection
   */
  registerConnection(connection) {
    if (this.isShuttingDown) {
      connection.destroy();
      return;
    }

    this.activeConnections.add(connection);

    connection.on('close', () => {
      this.activeConnections.delete(connection);
    });

    connection.on('error', () => {
      this.activeConnections.delete(connection);
    });
  }

  /**
   * Get active connections count
   */
  getActiveConnectionsCount() {
    return this.activeConnections.size;
  }

  /**
   * Close all active connections
   */
  closeAllConnections() {
    logger.info(`Closing ${this.activeConnections.size} active connections`);
    
    this.activeConnections.forEach(connection => {
      connection.destroy();
    });

    this.activeConnections.clear();
  }

  /**
   * Wait for all connections to close
   */
  async waitForConnections() {
    const maxWait = this.shutdownTimeout;
    const startTime = Date.now();

    while (this.activeConnections.size > 0 && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (this.activeConnections.size > 0) {
      logger.warn(`Timeout waiting for ${this.activeConnections.size} connections to close`);
      this.closeAllConnections();
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    logger.info('Starting graceful shutdown cleanup');

    try {
      // Close database connections
      const { closeDatabase } = require('../config/database');
      await closeDatabase();
      logger.info('Database connections closed');

      // Close any other resources here
      // await closeRedis();
      // await closeMessageQueue();

      logger.info('Graceful shutdown cleanup completed');
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  /**
   * Handle shutdown signal
   */
  async handleShutdown(signal) {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`Received shutdown signal: ${signal}`);

    try {
      // Set a timeout for force shutdown
      const shutdownTimeout = setTimeout(() => {
        logger.error('Graceful shutdown timeout, forcing exit');
        process.exit(1);
      }, this.shutdownTimeout);

      // Wait for connections to close
      await this.waitForConnections();

      // Cleanup resources
      await this.cleanup();

      // Clear timeout
      clearTimeout(shutdownTimeout);

      logger.info('Graceful shutdown completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Setup signal handlers
   */
  setupSignalHandlers() {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    signals.forEach(signal => {
      process.on(signal, () => {
        this.handleShutdown(signal);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.handleShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', { reason, promise });
      this.handleShutdown('UNHANDLED_REJECTION');
    });
  }
}

// Create singleton instance
const gracefulShutdown = new GracefulShutdown();

module.exports = gracefulShutdown;
