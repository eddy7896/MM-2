# Multi-stage Dockerfile for MoodMorph (React frontend + Express backend)

# --- Backend Build ---
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# --- Frontend Build ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --production
COPY frontend/ ./
RUN npm run build

# --- Production Image ---
FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend ./backend
# Copy frontend build
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Install serve for static frontend
RUN npm install -g serve

# Expose ports
EXPOSE 5000 3000

# Start both backend and frontend (static) using background processes
CMD ["sh", "-c", "cd backend && npm start & serve -s ../frontend/build -l 3000 && wait"]
