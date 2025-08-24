#!/bin/bash

# Stop script for Boginn Bókhald local environment

echo "🛑 Stopping Boginn Bókhald Local Environment..."

# Stop PM2 application
echo "📱 Stopping application..."
npm run pm2:stop 2>/dev/null || echo "Application was not running"

# Stop Docker services
echo "📦 Stopping database services..."
npm run db:down

echo "✅ Boginn Bókhald stopped successfully!"