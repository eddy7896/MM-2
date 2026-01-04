# Production Dockerfile for MoodMorph (Frontend + Backend)
# Multi-stage build for optimized production image

# ========== Backend Build Stage ==========
FROM node:18-alpine as backend-build

# Install build dependencies for Puppeteer and native modules
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    && apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Set Puppeteer and Node.js production settings
ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NPM_CONFIG_PRODUCTION=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false

WORKDIR /app/backend

# Copy package files first for better layer caching
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production --no-optional

# Copy the rest of the backend files
COPY backend/ .

# ========== Frontend Build Stage ==========
FROM node:18-alpine as frontend-build

WORKDIR /app/frontend

# Copy package files first for better layer caching
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production --no-optional

# Copy the rest of the frontend files
COPY frontend/ .

# Build the frontend with production settings
RUN npm run build

# ========== Production Stage ==========
FROM nginx:stable-alpine

# Install Node.js and create app directory
RUN apk add --no-cache --update nodejs && \
    rm -rf /var/cache/apk/*

# Set working directory for backend
WORKDIR /app/backend

# Copy backend files from build stage
COPY --from=backend-build /app/backend ./

# Create directory for frontend build and set permissions
RUN mkdir -p /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Copy frontend build to nginx
COPY --from=frontend-build --chown=nginx:nginx /app/frontend/build /usr/share/nginx/html

# Copy nginx configuration with security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the start script
COPY --chmod=755 start.sh /start.sh

# Set environment variables
ENV NODE_ENV=production \
    PORT=5000

# Expose ports (HTTP and Backend API)
EXPOSE 80 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Run as non-root user
USER nginx

# Start the application
ENTRYPOINT ["/start.sh"]
