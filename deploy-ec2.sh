#!/bin/bash

# MoodMorph EC2 Deployment Script
# Optimized for AWS EC2 t2.micro free tier

set -e

echo "🚀 Starting MoodMorph deployment on AWS EC2..."
echo "================================================"

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
sudo apt install -y git curl wget htop

# Install Docker (optimized for t2.micro)
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh

    # Configure Docker for low memory usage
    echo "⚙️ Configuring Docker for EC2 t2.micro..."
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
EOF
    sudo systemctl restart docker
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose already installed"
fi

# Configure swap for better performance on t2.micro
if [ ! -f /swapfile ]; then
    echo "💾 Setting up swap space for better performance..."
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Configure firewall
echo "🔥 Configuring UFW firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Build and start the application
echo "🏗️ Building and starting MoodMorph..."
docker-compose -f docker-compose.ec2.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.ec2.yml build --no-cache
docker-compose -f docker-compose.ec2.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 45

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.ec2.yml ps

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

# Display memory usage
echo "📊 Current memory usage:"
free -h

echo ""
echo "🎉 EC2 Deployment completed successfully!"
echo "================================================"
echo "📍 Your MoodMorph application is now running at:"
echo "   http://$SERVER_IP"
echo ""
echo "🔧 Management Commands:"
echo "   Check logs:    docker-compose -f docker-compose.ec2.yml logs -f"
echo "   Restart:       docker-compose -f docker-compose.ec2.yml restart"
echo "   Stop:          docker-compose -f docker-compose.ec2.yml down"
echo "   Monitor:       docker stats"
echo ""
echo "💡 Tips for EC2 t2.micro:"
echo "   - Monitor memory usage with: free -h"
echo "   - Check swap usage with: swapon --show"
echo "   - Restart if memory issues: sudo reboot"
echo ""
