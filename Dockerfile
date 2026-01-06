# Multi-stage Docker build for Hestia

# Frontend Build Stage
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy frontend source
COPY . .

# Build Next.js app
RUN npm run build

# Backend Build Stage
FROM python:3.11-slim AS backend-builder
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Production Stage
FROM python:3.11-slim
WORKDIR /app

# Install Node.js for running Next.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy backend code
COPY backend/ ./backend/

# Copy frontend build
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/package.json ./
COPY --from=frontend-builder /app/public ./public

# Create non-root user
RUN useradd -m -u 1000 hestia && chown -R hestia:hestia /app
USER hestia

# Expose ports
EXPOSE 3002 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Start both services
CMD ["sh", "-c", "python -m backend.app.main & npm run dev"]
