#!/bin/bash

# Redeploy MoodMorph on EC2
# This script will clean up existing containers and redeploy the application
# Run this script from the project root directory

set -e

echo "🚀 Starting MoodMorph redeployment..."
echo "================================"

# Ensure we're in the correct directory
if [ ! -f "docker-compose.ec2.yml" ]; then
    echo "❌ Error: docker-compose.ec2.yml not found. Please run this script from the project root directory."
    exit 1
fi

# Stop and remove all containers
echo "🛑 Stopping and removing all containers..."
docker-compose -f docker-compose.ec2.yml down --remove-orphans || true

# Remove all unused containers, networks, and images
echo "🧹 Cleaning up Docker resources..."
docker system prune -a -f --volumes

# Pull the latest code
echo "⬇️ Pulling latest code..."
git pull origin main

# Rebuild and start the containers
echo "🔨 Rebuilding and starting containers..."
docker-compose -f docker-compose.ec2.yml up -d --build

echo ""
echo "✅ Redeployment complete!"
echo "🌐 Your application should be available at http://your-ec2-public-ip/"
echo ""
echo "📝 To view logs, run: docker-compose -f docker-compose.ec2.yml logs -f"

# Show running containers
echo ""
echo "🐳 Running containers:"
docker ps
