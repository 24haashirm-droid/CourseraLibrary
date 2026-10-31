# Multi-stage Dockerfile for CourseFinder Unified Global Deployment
# Stage 1: Build React Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build and Run Production Node.js Server
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Copy built frontend assets to where backend expects them
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Persistent directory for SQLite database
RUN mkdir -p /app/backend/data
VOLUME ["/app/backend/data"]

EXPOSE 5000

CMD ["node", "src/server.js"]
