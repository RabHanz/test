#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Build and deploy
echo "Building and deploying Integration Management Dashboard..."

# Pull latest changes
git pull origin main

# Build Docker images
docker-compose -f deployment/docker-compose.yml build

# Run database migrations
docker-compose -f deployment/docker-compose.yml run --rm app npx prisma migrate deploy

# Deploy services
docker-compose -f deployment/docker-compose.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check service health
echo "Checking service health..."
curl -f http://localhost:3000/api/health || exit 1

echo "Deployment completed successfully!" 