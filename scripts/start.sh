#!/bin/bash

# Startup script for Boginn Bókhald local environment
# This script sets up the database and starts the application

set -e

echo "🏹 Starting Boginn Bókhald Local Environment..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start PostgreSQL database
echo "📦 Starting PostgreSQL database..."
npm run db:up

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is responding
until docker exec archery-db pg_isready -h localhost -p 5432 -U archery >/dev/null 2>&1; do
    echo "⏳ Waiting for database..."
    sleep 2
done

echo "✅ Database is ready!"

# Run database setup (migrations, generate client, seed data)
echo "🗄️ Setting up database..."
npm run db:setup

# Build the application for production
echo "🔨 Building application..."
npm run build:prod

# Start the application with PM2
echo "🚀 Starting application with PM2..."
npm run pm2:start

echo ""
echo "✅ Boginn Bókhald is running!"
echo "📱 Application: http://localhost:3003"
echo "🗄️ PgAdmin: http://localhost:5051 (admin@example.com / admin)"
echo "📊 PM2 Logs: npm run pm2:logs"
echo ""
echo "To stop: npm run pm2:stop && npm run db:down"