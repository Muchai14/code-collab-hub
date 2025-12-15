# Code Collaboration Hub - Docker Deployment Guide

## Overview

This guide provides complete instructions for deploying the Code Collaboration Hub using Docker Compose with PostgreSQL.

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ :80
       ▼
┌─────────────┐
│    Nginx    │ ← Serves frontend & proxies API/WebSocket
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼ /api            ▼ /socket.io
┌─────────────┐    ┌─────────────┐
│   Backend   │    │   Backend   │
│  (FastAPI)  │◄───┤(Socket.IO)  │
└──────┬──────┘    └─────────────┘
       │ :5432
       ▼
┌─────────────┐
│ PostgreSQL  │
└─────────────┘
```

## Services

### 1. PostgreSQL Database
- **Image**: `postgres:15-alpine`
- **Container**: `code-collab-db`
- **Port**: 5432
- **Credentials**:
  - User: `code_collab`
  - Password: `code_collab_password`
  - Database: `code_collab_db`
- **Volume**: `postgres_data` (persists across restarts)

### 2. Backend (FastAPI)
- **Built from**: `./backend/Dockerfile`
- **Container**: `code-collab-backend`
- **Port**: 3001 (internal)
- **Features**:
  - Hot reload enabled for development
  - Async database operations
  - WebSocket support via Socket.IO
  - Health check endpoint at `/health`

### 3. Nginx + Frontend
- **Built from**: `./frontend/Dockerfile` (multi-stage)
- **Container**: `code-collab-nginx`
- **Port**: 80 (external)
- **Responsibilities**:
  - Serve React frontend static files
  - Reverse proxy to backend API
  - WebSocket proxy for real-time features
  - Gzip compression
  - MIME type handling

## Quick Start

### 1. Start Services

```bash
# Using Docker Compose
docker-compose up --build -d

# Or using Makefile
make up
```

### 2. Check Status

```bash
# View running containers
docker-compose ps

# Or
make status
```

Expected output:
```
NAME                    STATUS              PORTS
code-collab-backend     Up (healthy)        0.0.0.0:3001->3001/tcp
code-collab-db          Up (healthy)        0.0.0.0:5432->5432/tcp
code-collab-nginx       Up                  0.0.0.0:80->80/tcp
```

### 3. Access Application

- **Frontend**: http://localhost
- **API Docs**: http://localhost/api/docs
- **Health Check**: http://localhost/health

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f nginx

# Or using Makefile
make logs
make logs-backend
make logs-db
make logs-nginx
```

## Common Operations

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
docker-compose restart nginx
```

### Stop Services

```bash
# Stop but keep data
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Rebuild Services

```bash
# Rebuild everything
docker-compose up --build

# Rebuild specific service
docker-compose up --build backend
docker-compose up --build nginx
```

### Database Operations

#### Connect to PostgreSQL

```bash
docker-compose exec postgres psql -U code_collab -d code_collab_db
```

#### Backup Database

```bash
docker-compose exec postgres pg_dump -U code_collab code_collab_db > backup.sql
```

#### Restore Database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U code_collab -d code_collab_db
```

#### View Tables

```sql
-- In psql shell
\dt

-- View table schema
\d rooms
\d users
```

### Running Tests

```bash
# Backend unit tests
docker-compose exec backend pytest tests/

# Backend integration tests
docker-compose exec backend pytest tests_integration/

# All tests
docker-compose exec backend pytest
```

## Environment Configuration

### Development (default)

The default configuration in `docker-compose.yml` is optimized for development:
- Hot reload enabled
- Source code mounted as volumes
- Ports exposed for direct access
- Verbose logging

### Production

For production, modify `docker-compose.yml`:

1. **Remove hot reload**:
   ```yaml
   backend:
     command: uvicorn main:app --host 0.0.0.0 --port 3001 --workers 4
   ```

2. **Remove volume mounts** (except postgres_data):
   ```yaml
   backend:
     # Remove these lines:
     # volumes:
     #   - ./backend:/app
   ```

3. **Use environment file**:
   ```yaml
   backend:
     env_file:
       - .env.production
   ```

4. **Add SSL to nginx**:
   - Mount SSL certificates
   - Update nginx.conf for HTTPS

5. **Use secrets for passwords**:
   ```yaml
   services:
     postgres:
       environment:
         POSTGRES_PASSWORD_FILE: /run/secrets/db_password
       secrets:
         - db_password
   
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```

## Troubleshooting

### Port 80 Already in Use

```bash
# Find what's using port 80
sudo lsof -i :80

# Kill the process or change the port in docker-compose.yml
ports:
  - "8080:80"  # Change to 8080
```

### Backend Can't Connect to Database

```bash
# Check postgres health
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Verify environment variables
docker-compose exec backend env | grep DATABASE
```

### Frontend Not Loading

```bash
# Check nginx logs
docker-compose logs nginx

# Rebuild frontend
docker-compose up --build nginx

# Check if files exist in container
docker-compose exec nginx ls -la /usr/share/nginx/html
```

### WebSocket Connection Failed

```bash
# Check nginx configuration
docker-compose exec nginx cat /etc/nginx/nginx.conf

# Verify backend is running
docker-compose ps backend

# Check browser console for errors
# Should connect to: ws://localhost/socket.io
```

### Database Permissions Error

```bash
# Reset the database volume
docker-compose down -v
docker-compose up --build
```

### Out of Disk Space

```bash
# Clean up unused Docker resources
docker system prune -af

# Remove only stopped containers
docker container prune

# Remove unused volumes
docker volume prune
```

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost/health

# Database health
docker-compose exec postgres pg_isready -U code_collab
```

### Resource Usage

```bash
# View resource consumption
docker stats

# Specific container
docker stats code-collab-backend
```

### Logs

```bash
# Follow logs with timestamp
docker-compose logs -f -t

# Last 100 lines
docker-compose logs --tail=100

# Filter by service
docker-compose logs backend | grep ERROR
```

## Scaling (Advanced)

To run multiple backend instances:

```yaml
services:
  backend:
    deploy:
      replicas: 3
    # Remove container_name when scaling
```

Then update nginx to load balance:

```nginx
upstream backend {
    server backend:3001;
    # Docker Compose will handle load balancing
}
```

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Use environment variables/secrets for sensitive data
- [ ] Enable SSL/TLS in nginx
- [ ] Configure CORS properly in backend
- [ ] Use non-root user in Dockerfiles
- [ ] Scan images for vulnerabilities: `docker scan <image>`
- [ ] Keep base images updated
- [ ] Use specific image versions (not `latest`)
- [ ] Enable firewall rules
- [ ] Regular database backups

## Performance Optimization

### Backend
- Use more uvicorn workers: `--workers 4`
- Configure connection pooling in SQLAlchemy
- Enable Redis for caching (future enhancement)

### Frontend
- Nginx gzip compression (already enabled)
- Browser caching headers
- CDN for static assets

### Database
- Tune PostgreSQL configuration
- Add indexes for frequently queried fields
- Regular VACUUM operations

## Useful Commands Reference

```bash
# Makefile shortcuts
make help              # Show all available commands
make build            # Build all images
make up               # Start services
make dev              # Start with logs
make down             # Stop services
make clean            # Remove all data
make logs             # View all logs
make test             # Run tests
make shell-backend    # Backend shell
make shell-db         # Database shell

# Docker Compose commands
docker-compose up -d              # Start detached
docker-compose down -v            # Stop and remove volumes
docker-compose ps                 # List containers
docker-compose logs -f [service]  # Follow logs
docker-compose exec [service] sh  # Execute shell
docker-compose restart [service]  # Restart service
docker-compose build --no-cache   # Rebuild without cache
```

## Next Steps

1. Configure custom domain and SSL
2. Set up CI/CD pipeline
3. Add monitoring (Prometheus + Grafana)
4. Implement database migrations (Alembic)
5. Add Redis for session management
6. Configure logging aggregation
7. Set up automated backups

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Verify configuration: `docker-compose config`
3. Review this guide thoroughly
4. Check GitHub issues
