# Multi-stage Dockerfile for combined frontend + backend deployment
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Backend with frontend static files
FROM python:3.12-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# Copy built frontend from stage 1
COPY --from=frontend-builder /frontend/dist ./static

# Expose port
EXPOSE 8080

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Run the application
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
