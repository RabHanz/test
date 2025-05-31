const config = {
  staging: {
    api: {
      baseUrl: process.env.STAGING_API_URL || 'https://staging-api.example.com',
      timeout: 30000,
      retryAttempts: 3,
    },
    websocket: {
      url: process.env.STAGING_WS_URL || 'wss://staging-ws.example.com',
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
    },
    database: {
      url: process.env.STAGING_DATABASE_URL,
      poolSize: 10,
      idleTimeoutMillis: 30000,
    },
    redis: {
      url: process.env.STAGING_REDIS_URL,
      ttl: 3600,
    },
    logging: {
      level: 'debug',
      format: 'json',
      destination: 'file',
      filename: 'staging.log',
    },
    monitoring: {
      enabled: true,
      samplingRate: 0.1,
      metricsEndpoint: '/metrics',
    },
    security: {
      cors: {
        origin: ['https://staging.example.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
      },
    },
  },
  production: {
    api: {
      baseUrl: process.env.PROD_API_URL || 'https://api.example.com',
      timeout: 30000,
      retryAttempts: 3,
    },
    websocket: {
      url: process.env.PROD_WS_URL || 'wss://ws.example.com',
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
    },
    database: {
      url: process.env.PROD_DATABASE_URL,
      poolSize: 20,
      idleTimeoutMillis: 30000,
    },
    redis: {
      url: process.env.PROD_REDIS_URL,
      ttl: 3600,
    },
    logging: {
      level: 'info',
      format: 'json',
      destination: 'file',
      filename: 'production.log',
    },
    monitoring: {
      enabled: true,
      samplingRate: 1.0,
      metricsEndpoint: '/metrics',
    },
    security: {
      cors: {
        origin: ['https://example.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50, // limit each IP to 50 requests per windowMs
      },
    },
  },
};

// Environment-specific configuration
const env = process.env.NODE_ENV || 'staging';
const currentConfig = config[env];

// Export configuration
module.exports = {
  ...currentConfig,
  env,
  isProduction: env === 'production',
  isStaging: env === 'staging',
  
  // Common configuration
  app: {
    name: 'Automation Dashboard',
    version: process.env.APP_VERSION || '1.0.0',
    port: process.env.PORT || 3000,
  },
  
  // Feature flags
  features: {
    realTimeUpdates: true,
    advancedFiltering: true,
    exportFunctionality: true,
    auditLogging: true,
  },
  
  // Cache configuration
  cache: {
    ttl: 300, // 5 minutes
    maxSize: 1000,
    updateInterval: 60, // 1 minute
  },
  
  // Error handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 5000,
  },
  
  // Performance monitoring
  performance: {
    metrics: {
      enabled: true,
      interval: 60000, // 1 minute
    },
    tracing: {
      enabled: true,
      samplingRate: env === 'production' ? 0.1 : 1.0,
    },
  },
  
  // Backup configuration
  backup: {
    enabled: true,
    schedule: '0 0 * * *', // Daily at midnight
    retention: 30, // 30 days
    storage: {
      type: 's3',
      bucket: process.env.BACKUP_BUCKET,
    },
  },
  
  // Alert configuration
  alerts: {
    email: {
      enabled: true,
      recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
    },
    slack: {
      enabled: true,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
    },
    thresholds: {
      errorRate: 0.05, // 5%
      responseTime: 2000, // 2 seconds
      cpuUsage: 80, // 80%
      memoryUsage: 80, // 80%
    },
  },
}; 