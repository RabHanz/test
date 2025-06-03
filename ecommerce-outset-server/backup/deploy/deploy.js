const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Utility functions
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const error = (message) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
  process.exit(1);
};

const runCommand = (command) => {
  try {
    log(`Running command: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    error(`Command failed: ${command}\n${err.message}`);
  }
};

// Deployment steps
const validateEnvironment = () => {
  log('Validating environment...');
  
  // Check required environment variables
  const requiredVars = [
    'NODE_ENV',
    'DATABASE_URL',
    'REDIS_URL',
    'API_URL',
    'WS_URL',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Validate database connection
  try {
    runCommand('npx prisma db pull');
  } catch (err) {
    error('Failed to validate database connection');
  }
};

const runTests = () => {
  log('Running tests...');
  
  // Run unit tests
  runCommand('npm run test:unit');
  
  // Run integration tests
  runCommand('npm run test:integration');
  
  // Run performance tests
  runCommand('npm run test:performance');
};

const buildApplication = () => {
  log('Building application...');
  
  // Clean build directory
  const buildDir = path.join(__dirname, '../build');
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
  }
  
  // Install dependencies
  runCommand('npm ci');
  
  // Build application
  runCommand('npm run build');
  
  // Generate Prisma client
  runCommand('npx prisma generate');
};

const runMigrations = () => {
  log('Running database migrations...');
  
  // Run migrations
  runCommand('npx prisma migrate deploy');
  
  // Verify migrations
  runCommand('npx prisma migrate status');
};

const deployToEnvironment = () => {
  log(`Deploying to ${config.env} environment...`);
  
  // Create deployment directory
  const deployDir = path.join(__dirname, `../deployments/${config.env}`);
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }
  
  // Copy build files
  runCommand(`cp -r build/* ${deployDir}`);
  
  // Copy configuration
  runCommand(`cp deploy/config.js ${deployDir}`);
  
  // Copy package files
  runCommand(`cp package*.json ${deployDir}`);
  
  // Install production dependencies
  runCommand(`cd ${deployDir} && npm ci --production`);
};

const verifyDeployment = () => {
  log('Verifying deployment...');
  
  // Check application health
  try {
    const response = execSync(`curl -f ${config.api.baseUrl}/health`).toString();
    if (!response.includes('ok')) {
      throw new Error('Health check failed');
    }
  } catch (err) {
    error('Deployment verification failed');
  }
  
  // Check database connection
  try {
    runCommand('npx prisma db pull');
  } catch (err) {
    error('Database connection verification failed');
  }
  
  // Check Redis connection
  try {
    runCommand('node scripts/verify-redis.js');
  } catch (err) {
    error('Redis connection verification failed');
  }
};

const notifyDeployment = () => {
  log('Sending deployment notifications...');
  
  const deploymentInfo = {
    environment: config.env,
    version: config.app.version,
    timestamp: new Date().toISOString(),
    status: 'success',
  };
  
  // Send Slack notification
  if (config.alerts.slack.enabled) {
    try {
      const message = {
        text: `Deployment completed successfully!\nEnvironment: ${deploymentInfo.environment}\nVersion: ${deploymentInfo.version}\nTime: ${deploymentInfo.timestamp}`,
      };
      
      execSync(`curl -X POST -H 'Content-type: application/json' --data '${JSON.stringify(message)}' ${config.alerts.slack.webhookUrl}`);
    } catch (err) {
      log('Failed to send Slack notification');
    }
  }
  
  // Send email notification
  if (config.alerts.email.enabled) {
    try {
      const emailContent = `
        Deployment completed successfully!
        Environment: ${deploymentInfo.environment}
        Version: ${deploymentInfo.version}
        Time: ${deploymentInfo.timestamp}
      `;
      
      execSync(`node scripts/send-email.js "${config.alerts.email.recipients.join(',')}" "Deployment Notification" "${emailContent}"`);
    } catch (err) {
      log('Failed to send email notification');
    }
  }
};

// Main deployment process
const deploy = async () => {
  try {
    log('Starting deployment process...');
    
    // Validate environment
    validateEnvironment();
    
    // Run tests
    runTests();
    
    // Build application
    buildApplication();
    
    // Run migrations
    runMigrations();
    
    // Deploy to environment
    deployToEnvironment();
    
    // Verify deployment
    verifyDeployment();
    
    // Send notifications
    notifyDeployment();
    
    log('Deployment completed successfully!');
  } catch (err) {
    error(`Deployment failed: ${err.message}`);
  }
};

// Run deployment
deploy(); 