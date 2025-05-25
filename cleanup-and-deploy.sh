#!/bin/bash

# Cleanup and Deploy Script for MoodMorph
# This script will:
# 1. Remove the existing project directory
# 2. Clone the latest version from GitHub
# 3. Set up and deploy the application

set -e

PROJECT_DIR="MoodMorph"
GIT_REPO="https://github.com/eddy7896/MM-2.git"

echo "🚀 Starting cleanup and deployment..."
echo "================================"

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Stop and remove any running containers
echo "🛑 Stopping and removing any running containers..."
docker-compose -f $PROJECT_DIR/docker-compose.ec2.yml down --remove-orphans 2>/dev/null || true

# Remove the old directory if it exists
if [ -d "$PROJECT_DIR" ]; then
    echo "🗑️  Removing old project directory..."
    rm -rf "$PROJECT_DIR"
fi

# Clone the repository
echo "⬇️  Cloning the repository..."
git clone $GIT_REPO $PROJECT_DIR

# Navigate to project directory
cd $PROJECT_DIR

# Make the deploy script executable
chmod +x redeploy-ec2.sh

# Run the redeployment
./redeploy-ec2.sh

echo ""
echo "✅ Cleanup and deployment complete!"
echo "🌐 Your application should be available at http://your-ec2-public-ip/"
echo "📝 To view logs, run: docker-compose -f docker-compose.ec2.yml logs -f"
