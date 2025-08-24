#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Checking Local Setup Prerequisites...\n');

// Check if Docker is installed
try {
    execSync('docker --version', { stdio: 'pipe' });
    console.log('✅ Docker is installed');
} catch (error) {
    console.log('❌ Docker is not installed or not in PATH');
    console.log('   Install Docker Desktop from: https://www.docker.com/products/docker-desktop');
    process.exit(1);
}

// Check if Docker is running
try {
    execSync('docker info', { stdio: 'pipe' });
    console.log('✅ Docker daemon is running');
} catch (error) {
    console.log('❌ Docker daemon is not running');
    console.log('   Start Docker Desktop and try again');
    process.exit(1);
}

// Check if PM2 is installed
try {
    execSync('pm2 --version', { stdio: 'pipe' });
    console.log('✅ PM2 is installed');
} catch (error) {
    console.log('❌ PM2 is not installed globally');
    console.log('   Install with: npm install -g pm2');
    process.exit(1);
}

// Check if .env file exists
if (fs.existsSync('.env')) {
    console.log('✅ Environment file (.env) exists');
} else {
    console.log('❌ Environment file (.env) not found');
    process.exit(1);
}

// Check if build directory exists (for production mode)
if (fs.existsSync('.next')) {
    console.log('✅ Next.js build exists');
} else {
    console.log('⚠️  Next.js not built yet (will build during startup)');
}

console.log('\n🎉 All prerequisites met! Ready to run:');
console.log('   npm run local:start');