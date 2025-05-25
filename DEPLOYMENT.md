# MoodMorph VPS Deployment Guide

This guide will help you deploy MoodMorph to a free VPS hosting platform using Docker.

## Free VPS Hosting Platforms

### 1. Oracle Cloud Always Free (Recommended)
- **Resources**: 1-4 ARM cores, 6-24 GB RAM, 200 GB storage
- **Duration**: Permanent free tier
- **Best for**: Production deployments

### 2. Google Cloud Platform
- **Resources**: 1 f1-micro instance (1 vCPU, 0.6 GB RAM)
- **Duration**: Always free + $300 credit for 90 days
- **Best for**: Testing and small deployments

### 3. AWS EC2 Free Tier
- **Resources**: t2.micro (1 vCPU, 1 GB RAM)
- **Duration**: 12 months free
- **Best for**: Learning and development

## Step-by-Step Deployment (Oracle Cloud)

### Step 1: Create Oracle Cloud Account
1. Go to [Oracle Cloud](https://cloud.oracle.com/)
2. Click "Start for free"
3. Complete registration (credit card required for verification)
4. Verify your account

### Step 2: Create VPS Instance
1. Login to Oracle Cloud Console
2. Navigate to **Compute > Instances**
3. Click **"Create Instance"**
4. Configure:
   - **Name**: `moodmorph-server`
   - **Image**: Ubuntu 22.04
   - **Shape**: VM.Standard.A1.Flex (ARM-based, free tier)
   - **OCPUs**: 2-4 (recommended for better performance)
   - **Memory**: 12-24 GB
   - **Boot Volume**: 100-200 GB
5. **Networking**: Assign public IP
6. **SSH Key**: Upload your public key or generate new one
7. Click **"Create"**

### Step 3: Configure Security Rules
1. Go to **Networking > Virtual Cloud Networks**
2. Click on your VCN → Subnet → Default Security List
3. Add these **Ingress Rules**:
   ```
   Rule 1: HTTP
   - Source CIDR: 0.0.0.0/0
   - IP Protocol: TCP
   - Destination Port: 80
   
   Rule 2: HTTPS
   - Source CIDR: 0.0.0.0/0
   - IP Protocol: TCP
   - Destination Port: 443
   
   Rule 3: Development (Optional)
   - Source CIDR: 0.0.0.0/0
   - IP Protocol: TCP
   - Destination Port: 3000
   ```

### Step 4: Connect to Your VPS
```bash
ssh -i /path/to/your/private-key.pem ubuntu@YOUR_INSTANCE_PUBLIC_IP
```

### Step 5: Deploy MoodMorph

#### Option A: Automated Deployment (Recommended)
```bash
# Clone the repository
git clone https://github.com/eddy7896/web-analyser.git
cd web-analyser

# Make deployment script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

#### Option B: Manual Deployment
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
# SSH back in

# Clone repository
git clone https://github.com/eddy7896/web-analyser.git
cd web-analyser

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build
```

### Step 6: Access Your Application
Your MoodMorph application will be available at:
```
http://YOUR_INSTANCE_PUBLIC_IP
```

## Management Commands

### Check Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

## Troubleshooting

### Common Issues

1. **Port 80 not accessible**
   - Check security group rules
   - Ensure firewall allows HTTP traffic
   - Verify nginx is running

2. **Backend API errors**
   - Check backend logs: `docker-compose -f docker-compose.prod.yml logs backend`
   - Ensure Puppeteer dependencies are installed

3. **Out of memory errors**
   - Increase VPS memory allocation
   - Monitor resource usage: `docker stats`

4. **SSL/HTTPS Setup**
   - Use Let's Encrypt with Certbot
   - Configure nginx for SSL termination

### Performance Optimization

1. **Enable Gzip Compression**
   - Add gzip configuration to nginx.conf

2. **Optimize Docker Images**
   - Use multi-stage builds
   - Minimize image layers

3. **Resource Monitoring**
   ```bash
   # Monitor resource usage
   docker stats
   
   # Check disk usage
   df -h
   
   # Monitor system resources
   htop
   ```

## Security Considerations

1. **Firewall Configuration**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

2. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **SSH Key Authentication**
   - Disable password authentication
   - Use strong SSH keys

4. **Docker Security**
   - Run containers as non-root user
   - Keep Docker updated
   - Scan images for vulnerabilities

## Domain Setup (Optional)

1. **Purchase Domain** (or use free services like Freenom)
2. **Configure DNS** to point to your VPS IP
3. **Setup SSL** with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Support

If you encounter issues:
1. Check the logs first
2. Verify all services are running
3. Ensure firewall rules are correct
4. Check Oracle Cloud security groups
5. Monitor resource usage

For additional help, refer to the main README.md or create an issue in the repository.
