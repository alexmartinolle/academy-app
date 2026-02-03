require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const { logger } = require('./utils/logger');
const ErrorHandler = require('./utils/errorHandler');
const requestLogger = require('./utils/requestLogger');

// Import routes
const studentsRouter = require('./routes/students');
const plansRouter = require('./routes/plans');
const paymentsRouter = require('./routes/payments');
const modalitiesRouter = require('./routes/modalities');
const statsRouter = require('./routes/stats');
const studentPlansRouter = require('./routes/studentPlans');

/**
 * Express application setup
 */
class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup application middleware
   */
  setupMiddleware() {
    // Security headers
    if (config.getFeatureFlags().csp) {
      this.app.use(helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        },
        hsts: config.getSecurityHeadersConfig().hsts ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        } : false
      }));
    } else {
      this.app.use(helmet());
    }

    // CORS configuration
    this.app.use(cors({
      origin: config.getCORSConfig().origin,
      credentials: config.getCORSConfig().credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Response compression
    if (config.getFeatureFlags().compression) {
      this.app.use(compression({
        level: config.getPerformanceConfig().compressionLevel,
        threshold: 1024
      }));
    }

    // Rate limiting
    const rateLimitConfig = config.getRateLimitConfig();
    this.app.use(rateLimit({
      windowMs: rateLimitConfig.windowMs,
      max: rateLimitConfig.max,
      message: {
        success: false,
        error: {
          message: rateLimitConfig.message,
          timestamp: new Date().toISOString()
        }
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.url,
          method: req.method
        });
        res.status(429).json({
          success: false,
          error: {
            message: rateLimitConfig.message,
            timestamp: new Date().toISOString(),
            retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000)
          }
        });
      }
    }));

    // Request logging
    if (config.getLoggingConfig().requests) {
      this.app.use(requestLogger);
    }

    // Body parsing
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // Trust proxy for rate limiting and IP detection
    this.app.use(express.static('public'));
    this.app.set('trust proxy', 1);

    // Request timeout
    this.app.use((req, res, next) => {
      const timeout = config.getPerformanceConfig().requestTimeout;
      res.setTimeout(timeout, () => {
        logger.warn('Request timeout', {
          url: req.url,
          method: req.method,
          ip: req.ip,
          timeout
        });
        res.status(408).json({
          success: false,
          error: {
            message: 'Request timeout',
            timestamp: new Date().toISOString()
          }
        });
      });
      next();
    });
  }

  /**
   * Setup application routes
   */
  setupRoutes() {
    const apiConfig = config.getAPIConfig();
    
    // Health check endpoint
    this.app.get(apiConfig.healthEndpoint, ErrorHandler.asyncHandler(async (req, res) => {
      const healthCheck = await this.performHealthCheck();
      res.status(healthCheck.status === 'healthy' ? 200 : 503).json({
        success: healthCheck.status === 'healthy',
        data: healthCheck,
        timestamp: new Date().toISOString()
      });
    }));

    // API routes
    this.app.use(`${apiConfig.basePath}/students`, studentsRouter);
    this.app.use(`${apiConfig.basePath}/plans`, plansRouter);
    this.app.use(`${apiConfig.basePath}/payments`, paymentsRouter);
    this.app.use(`${apiConfig.basePath}/modalities`, modalitiesRouter);
    this.app.use(`${apiConfig.basePath}/stats`, statsRouter);
    this.app.use(`${apiConfig.basePath}/student-plans`, studentPlansRouter);

    // API documentation endpoint (if enabled)
    if (config.getFeatureFlags().apiDocs) {
      this.app.get(apiConfig.docsEndpoint, (req, res) => {
        res.json({
          success: true,
          data: {
            title: 'Academy App API',
            version: apiConfig.version,
            description: 'RESTful API for Martial Arts Academy Management',
            baseUrl: `${req.protocol}://${req.get('host')}${apiConfig.basePath}`,
            endpoints: {
              students: `${apiConfig.basePath}/students`,
              plans: `${apiConfig.basePath}/plans`,
              payments: `${apiConfig.basePath}/payments`,
              modalities: `${apiConfig.basePath}/modalities`,
              stats: `${apiConfig.basePath}/stats`,
              studentPlans: `${apiConfig.basePath}/student-plans`
            },
            documentation: `${req.protocol}://${req.get('host')}${apiConfig.docsEndpoint}`
          },
          timestamp: new Date().toISOString()
        });
      });
    }

    // Metrics endpoint (if enabled)
    if (config.getFeatureFlags().metrics) {
      this.app.get(apiConfig.metricsEndpoint, ErrorHandler.asyncHandler(async (req, res) => {
        const metrics = await this.getMetrics();
        res.json({
          success: true,
          data: metrics,
          timestamp: new Date().toISOString()
        });
      }));
    }

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: {
          message: 'Endpoint not found',
          path: req.originalUrl,
          method: req.method,
          timestamp: new Date().toISOString()
        }
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // Global error handler
    this.app.use(ErrorHandler.middleware());
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.get('NODE_ENV'),
      version: process.env.npm_package_version || '1.0.0',
      checks: {}
    };

    try {
      // Database health check
      const { testConnection } = require('./config/database');
      const dbHealth = await testConnection();
      healthCheck.checks.database = {
        status: dbHealth ? 'healthy' : 'unhealthy',
        responseTime: dbHealth ? 'OK' : 'Failed'
      };

      // Memory check
      const memoryUsage = process.memoryUsage();
      healthCheck.checks.memory = {
        status: 'healthy',
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
      };

      // CPU check
      const cpuUsage = process.cpuUsage();
      healthCheck.checks.cpu = {
        status: 'healthy',
        user: cpuUsage.user,
        system: cpuUsage.system
      };

      // Overall status
      const allHealthy = Object.values(healthCheck.checks)
        .every(check => check.status === 'healthy');

      healthCheck.status = allHealthy ? 'healthy' : 'unhealthy';

    } catch (error) {
      logger.error('Health check failed:', error);
      healthCheck.status = 'unhealthy';
      healthCheck.error = error.message;
    }

    return healthCheck;
  }

  /**
   * Get application metrics
   */
  async getMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        version: process.version,
        memory: {
          rss: memoryUsage.rss,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          arrayBuffers: memoryUsage.arrayBuffers
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      },
      server: {
        environment: config.get('NODE_ENV'),
        port: config.getNumber('PORT'),
        host: config.get('HOST')
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get Express app instance
   */
  getApp() {
    return this.app;
  }
}

// Create and export app instance
const appInstance = new App();
const app = appInstance.getApp();

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    const dbConnected = await require('./config/database').testConnection();
    if (!dbConnected) {
      logger.error('Cannot start server without database connection');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

module.exports = app;
