require('dotenv').config();

/**
 * Configuration management
 */
class Config {
  constructor() {
    this.validateRequiredEnv();
    this.setDefaults();
  }

  /**
   * Validate required environment variables
   */
  validateRequiredEnv() {
    const required = [
      'DB_HOST',
      'DB_PORT', 
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  /**
   * Set default values
   */
  setDefaults() {
    const defaults = {
      PORT: 3000,
      HOST: '0.0.0.0',
      NODE_ENV: 'development',
      LOG_LEVEL: 'info',
      LOG_MAX_SIZE: 5242880,
      LOG_MAX_FILES: 10,
      DB_MIN_POOL_SIZE: 2,
      DB_MAX_POOL_SIZE: 10,
      DB_IDLE_TIMEOUT: 30000,
      DB_CONNECTION_TIMEOUT: 10000,
      JWT_EXPIRES_IN: '7d',
      JWT_REFRESH_EXPIRES_IN: '30d',
      BCRYPT_ROUNDS: 12,
      CORS_ORIGIN: 'http://localhost:3001',
      CORS_CREDENTIALS: 'true',
      RATE_LIMIT_WINDOW_MS: 900000,
      RATE_LIMIT_MAX_REQUESTS: 100,
      WORKERS: require('os').cpus().length,
      ENABLE_CLUSTERING: 'false',
      SHUTDOWN_TIMEOUT: 10000,
      HTTPS_ENABLED: 'false',
      SESSION_TIMEOUT: 3600000,
      MAX_FILE_SIZE: 10485760,
      UPLOAD_DIR: 'uploads/',
      ALLOWED_FILE_TYPES: 'jpg,jpeg,png,pdf,doc,docx',
      REDIS_PORT: 6379,
      REDIS_DB: 0,
      CACHE_TTL: 3600,
      ENABLE_METRICS: 'true',
      METRICS_ENDPOINT: '/metrics',
      HEALTH_ENDPOINT: '/health',
      HOT_RELOAD: 'true',
      DEBUG: 'false',
      SOURCE_MAPS: 'true',
      ENABLE_AUTH: 'true',
      ENABLE_FILE_UPLOADS: 'false',
      ENABLE_EMAIL_NOTIFICATIONS: 'false',
      ENABLE_BACKGROUND_JOBS: 'false',
      ENABLE_CACHING: 'false',
      DEFAULT_CURRENCY: 'USD',
      DEFAULT_TIMEZONE: 'UTC',
      PAYMENT_REMINDER_DAYS: 3,
      MAX_OVERDUE_DAYS: 30,
      API_VERSION: 'v1',
      API_BASE_PATH: '/api',
      ENABLE_API_DOCS: 'true',
      API_DOCS_ENDPOINT: '/docs',
      ENABLE_COMPRESSION: 'true',
      COMPRESSION_LEVEL: 6,
      REQUEST_TIMEOUT: 30000,
      KEEP_ALIVE: 'true',
      CSP_ENABLED: 'true',
      HSTS_ENABLED: 'true',
      X_FRAME_OPTIONS: 'DENY',
      X_CONTENT_TYPE_OPTIONS: 'nosniff',
      DB_BACKUP_ENABLED: 'false',
      BACKUP_DIR: 'backups/',
      BACKUP_RETENTION_DAYS: 30,
      BACKUP_SCHEDULE: '0 2 * * *',
      ENABLE_SWAGGER: 'true',
      ENABLE_GRAPHQL_PLAYGROUND: 'false',
      ENABLE_DB_ADMIN: 'false',
      GDPR_COMPLIANCE: 'true'
    };

    Object.keys(defaults).forEach(key => {
      if (process.env[key] === undefined) {
        process.env[key] = defaults[key];
      }
    });
  }

  /**
   * Get configuration value
   */
  get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }

  /**
   * Get boolean configuration value
   */
  getBoolean(key, defaultValue = false) {
    const value = this.get(key);
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return value === 'true' || value === '1' || value === 'yes';
  }

  /**
   * Get number configuration value
   */
  getNumber(key, defaultValue = 0) {
    const value = this.get(key);
    if (value === null || value === undefined) {
      return defaultValue;
    }
    const num = parseInt(value, 10);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Get array configuration value (comma-separated)
   */
  getArray(key, defaultValue = []) {
    const value = this.get(key);
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }

  /**
   * Get JSON configuration value
   */
  getJSON(key, defaultValue = {}) {
    const value = this.get(key);
    if (value === null || value === undefined) {
      return defaultValue;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      return defaultValue;
    }
  }

  /**
   * Database configuration
   */
  getDatabaseConfig() {
    return {
      host: this.get('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      database: this.get('DB_NAME'),
      user: this.get('DB_USER'),
      password: this.get('DB_PASSWORD'),
      min: this.getNumber('DB_MIN_POOL_SIZE'),
      max: this.getNumber('DB_MAX_POOL_SIZE'),
      idleTimeoutMillis: this.getNumber('DB_IDLE_TIMEOUT'),
      connectionTimeoutMillis: this.getNumber('DB_CONNECTION_TIMEOUT')
    };
  }

  /**
   * Server configuration
   */
  getServerConfig() {
    return {
      port: this.getNumber('PORT'),
      host: this.get('HOST'),
      env: this.get('NODE_ENV'),
      workers: this.getNumber('WORKERS'),
      enableClustering: this.getBoolean('ENABLE_CLUSTERING'),
      shutdownTimeout: this.getNumber('SHUTDOWN_TIMEOUT'),
      httpsEnabled: this.getBoolean('HTTPS_ENABLED'),
      sslCertPath: this.get('SSL_CERT_PATH'),
      sslKeyPath: this.get('SSL_KEY_PATH'),
      sslCaPath: this.get('SSL_CA_PATH')
    };
  }

  /**
   * Security configuration
   */
  getSecurityConfig() {
    return {
      jwtSecret: this.get('JWT_SECRET'),
      jwtExpiresIn: this.get('JWT_EXPIRES_IN'),
      jwtRefreshExpiresIn: this.get('JWT_REFRESH_EXPIRES_IN'),
      bcryptRounds: this.getNumber('BCRYPT_ROUNDS'),
      sessionSecret: this.get('SESSION_SECRET'),
      sessionTimeout: this.getNumber('SESSION_TIMEOUT')
    };
  }

  /**
   * CORS configuration
   */
  getCORSConfig() {
    return {
      origin: this.getArray('CORS_ORIGIN'),
      credentials: this.getBoolean('CORS_CREDENTIALS')
    };
  }

  /**
   * Rate limiting configuration
   */
  getRateLimitConfig() {
    return {
      windowMs: this.getNumber('RATE_LIMIT_WINDOW_MS'),
      max: this.getNumber('RATE_LIMIT_MAX_REQUESTS'),
      message: this.get('RATE_LIMIT_MESSAGE')
    };
  }

  /**
   * Logging configuration
   */
  getLoggingConfig() {
    return {
      level: this.get('LOG_LEVEL'),
      file: this.get('LOG_FILE'),
      maxSize: this.getNumber('LOG_MAX_SIZE'),
      maxFiles: this.getNumber('LOG_MAX_FILES'),
      requests: this.getBoolean('LOG_REQUESTS'),
      dbQueries: this.getBoolean('LOG_DB_QUERIES')
    };
  }

  /**
   * File upload configuration
   */
  getFileUploadConfig() {
    return {
      maxSize: this.getNumber('MAX_FILE_SIZE'),
      uploadDir: this.get('UPLOAD_DIR'),
      allowedTypes: this.getArray('ALLOWED_FILE_TYPES')
    };
  }

  /**
   * Email configuration
   */
  getEmailConfig() {
    return {
      service: this.get('EMAIL_SERVICE'),
      smtp: {
        host: this.get('SMTP_HOST'),
        port: this.getNumber('SMTP_PORT'),
        user: this.get('SMTP_USER'),
        pass: this.get('SMTP_PASS')
      },
      from: {
        address: this.get('EMAIL_FROM'),
        name: this.get('EMAIL_FROM_NAME')
      }
    };
  }

  /**
   * Redis configuration
   */
  getRedisConfig() {
    return {
      host: this.get('REDIS_HOST'),
      port: this.getNumber('REDIS_PORT'),
      password: this.get('REDIS_PASSWORD'),
      db: this.getNumber('REDIS_DB'),
      ttl: this.getNumber('CACHE_TTL')
    };
  }

  /**
   * Feature flags
   */
  getFeatureFlags() {
    return {
      auth: this.getBoolean('ENABLE_AUTH'),
      fileUploads: this.getBoolean('ENABLE_FILE_UPLOADS'),
      emailNotifications: this.getBoolean('ENABLE_EMAIL_NOTIFICATIONS'),
      backgroundJobs: this.getBoolean('ENABLE_BACKGROUND_JOBS'),
      caching: this.getBoolean('ENABLE_CACHING'),
      metrics: this.getBoolean('ENABLE_METRICS'),
      apiDocs: this.getBoolean('ENABLE_API_DOCS'),
      swagger: this.getBoolean('ENABLE_SWAGGER'),
      graphqlPlayground: this.getBoolean('ENABLE_GRAPHQL_PLAYGROUND'),
      dbAdmin: this.getBoolean('ENABLE_DB_ADMIN'),
      compression: this.getBoolean('ENABLE_COMPRESSION')
    };
  }

  /**
   * Business configuration
   */
  getBusinessConfig() {
    return {
      currency: this.get('DEFAULT_CURRENCY'),
      timezone: this.get('DEFAULT_TIMEZONE'),
      paymentReminderDays: this.getNumber('PAYMENT_REMINDER_DAYS'),
      maxOverdueDays: this.getNumber('MAX_OVERDUE_DAYS')
    };
  }

  /**
   * API configuration
   */
  getAPIConfig() {
    return {
      version: this.get('API_VERSION'),
      basePath: this.get('API_BASE_PATH'),
      docsEndpoint: this.get('API_DOCS_ENDPOINT'),
      metricsEndpoint: this.get('METRICS_ENDPOINT'),
      healthEndpoint: this.get('HEALTH_ENDPOINT')
    };
  }

  /**
   * Performance configuration
   */
  getPerformanceConfig() {
    return {
      compressionLevel: this.getNumber('COMPRESSION_LEVEL'),
      requestTimeout: this.getNumber('REQUEST_TIMEOUT'),
      keepAlive: this.getBoolean('KEEP_ALIVE')
    };
  }

  /**
   * Security headers configuration
   */
  getSecurityHeadersConfig() {
    return {
      csp: this.getBoolean('CSP_ENABLED'),
      hsts: this.getBoolean('HSTS_ENABLED'),
      frameOptions: this.get('X_FRAME_OPTIONS'),
      contentTypeOptions: this.get('X_CONTENT_TYPE_OPTIONS')
    };
  }

  /**
   * Check if environment is development
   */
  isDevelopment() {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Check if environment is production
   */
  isProduction() {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if environment is test
   */
  isTest() {
    return this.get('NODE_ENV') === 'test';
  }

  /**
   * Get all configuration (for debugging)
   */
  getAll() {
    return {
      server: this.getServerConfig(),
      database: this.getDatabaseConfig(),
      security: this.getSecurityConfig(),
      cors: this.getCORSConfig(),
      rateLimit: this.getRateLimitConfig(),
      logging: this.getLoggingConfig(),
      fileUpload: this.getFileUploadConfig(),
      email: this.getEmailConfig(),
      redis: this.getRedisConfig(),
      features: this.getFeatureFlags(),
      business: this.getBusinessConfig(),
      api: this.getAPIConfig(),
      performance: this.getPerformanceConfig(),
      securityHeaders: this.getSecurityHeadersConfig()
    };
  }
}

// Create singleton instance
const config = new Config();

module.exports = config;
