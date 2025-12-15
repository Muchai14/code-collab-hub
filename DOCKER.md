# Docker Compose Setup Guide

This application uses Docker Compose to orchestrate the following services:
- **PostgreSQL**: Database
- **FastAPI Backend**: Python API with WebSocket support
- **Nginx**: Reverse proxy and static file server for the frontend

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)

## Quick Start

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - Backend Docs: http://localhost/api/docs (proxied from backend:3001)

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (removes database data):**
   ```bash
   docker-compose down -v
   ```

## Services

### PostgreSQL Database
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: code_collab_db
- **User**: code_collab
- **Password**: code_collab_password
- **Volume**: postgres_data (persists data)

### Backend (FastAPI)
- **Port**: 3001 (internal), proxied through nginx
- **Hot Reload**: Enabled (development mode)
- **Database**: Connects to PostgreSQL automatically

### Frontend (React/Vite)
- **Build**: Multi-stage Docker build
- **Served by**: Nginx
- **Port**: 80

### Nginx
- **Port**: 80
- **Routes**:
  - `/` → Frontend static files
  - `/api/*` → Backend API
  - `/socket.io/*` → WebSocket connections
  - `/health` → Backend health check

## Development

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f nginx
```

### Rebuild a specific service
```bash
docker-compose up --build backend
docker-compose up --build frontend
```

### Execute commands in containers
```bash
# Backend shell
docker-compose exec backend bash

# PostgreSQL shell
docker-compose exec postgres psql -U code_collab -d code_collab_db

# Run tests
docker-compose exec backend pytest
```

### Database migrations
The database schema is automatically created on startup via SQLAlchemy's `create_all()` in the lifespan event.

## Environment Variables

Copy `.env.example` to `.env` and customize if needed:
```bash
cp .env.example .env
```

## Production Considerations

For production deployment:

1. **Update environment variables** in `.env`:
   - Use strong passwords
   - Configure proper hostnames/domains

2. **Disable hot reload** in backend:
   - Remove `--reload` flag from the backend command in docker-compose.yml

3. **Use production ASGI server**:
   - Consider using gunicorn with uvicorn workers
   
4. **Add SSL/TLS**:
   - Configure nginx with SSL certificates
   - Use certbot for Let's Encrypt certificates

5. **Set proper CORS origins**:
   - Update `allow_origins` in backend/main.py

6. **Configure logging**:
   - Set up proper logging and monitoring

## Troubleshooting

### Database connection issues
```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres
```

### Frontend not loading
```bash
# Check nginx logs
docker-compose logs nginx

# Verify frontend build
docker-compose logs frontend
```

### Backend not responding
```bash
# Check backend logs
docker-compose logs backend

# Verify database connection
docker-compose exec backend python -c "from database import engine; import asyncio; asyncio.run(engine.connect())"
```

## Clean Restart

To completely reset the application:
```bash
docker-compose down -v
docker-compose up --build
```

This will:
- Stop all containers
- Remove all volumes (including database data)
- Rebuild all images
- Start fresh
