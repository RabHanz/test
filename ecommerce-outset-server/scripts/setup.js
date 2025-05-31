const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envExamplePath = path.join(__dirname, '..', '.env.example');
const envLocalPath = path.join(__dirname, '..', '.env.local');

const questions = [
  {
    name: 'NEXT_PUBLIC_API_URL',
    message: 'Enter your API URL (default: http://localhost:3001): ',
    default: 'http://localhost:3001'
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    message: 'Enter your app URL (default: http://localhost:3000): ',
    default: 'http://localhost:3000'
  },
  {
    name: 'NEXT_PUBLIC_ANALYTICS_ID',
    message: 'Enter your analytics ID: ',
    default: ''
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    message: 'Enter your Sentry DSN: ',
    default: ''
  }
];

async function setup() {
  try {
    // Check if .env.example exists
    if (!fs.existsSync(envExamplePath)) {
      console.error('Error: .env.example file not found');
      process.exit(1);
    }

    // Read .env.example
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    const envVars = {};

    // Ask questions and collect answers
    for (const question of questions) {
      const answer = await new Promise(resolve => {
        rl.question(question.message, input => {
          resolve(input || question.default);
        });
      });
      envVars[question.name] = answer;
    }

    // Generate .env.local content
    const envLocalContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Write .env.local
    fs.writeFileSync(envLocalPath, envLocalContent);
    console.log('\nEnvironment variables have been set up successfully!');
    console.log('You can now start the development server with: npm run dev');

  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup(); 