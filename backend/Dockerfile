# Backend Dockerfile
FROM node:18-alpine

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
    NPM_CONFIG_PRODUCTION=true \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --no-optional

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Command to run the application
CMD ["node", "index.js"]
