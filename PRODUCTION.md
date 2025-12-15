# Production Deployment Guide - Single Container

This guide covers deploying the Code Collaboration Hub as a **single container** that includes both the frontend and backend. This is ideal for:
- Cloud platforms (Google Cloud Run, AWS App Runner, Azure Container Apps)
- Platform-as-a-Service (Heroku, Railway, Render)
- Simple deployments with fewer moving parts
- Lower resource usage

## Architecture

```
┌──────────────────────────────┐
│   Code Collab Hub Container  │
│                              │
│  ┌────────────────────────┐  │
│  │   FastAPI Backend      │  │
│  │   - API Endpoints      │  │
│  │   - WebSocket/Socket.IO│  │
│  │   - Static File Serving│  │
│  └───────────┬──────────────┘  │
│              │                 │
│  ┌───────────▼──────────────┐  │
│  │  Frontend (Static files) │  │
│  │  - React SPA             │  │
│  │  - Built with Vite      │  │
│  └──────────────────────────┘  │
└───────────────┬──────────────┘
                │
                ▼
        ┌───────────────┐
        │  PostgreSQL   │
        │   Database    │
        └───────────────┘
```

## Quick Start

### Option 1: Using Dockerfile (Single Container)

**Build the image:**
```bash
docker build -t code-collab-hub:latest .
```

**Run with PostgreSQL:**
```bash
# Start PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_USER=code_collab \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=code_collab_db \
  -p 5432:5432 \
  postgres:15-alpine

# Run the application
docker run -d \
  --name code-collab-app \
  -p 8080:8080 \
  -e DATABASE_URL=postgresql://code_collab:secure_password@postgres:5432/code_collab_db \
  --link postgres \
  code-collab-hub:latest
```

**Or using make:**
```bash
make build-prod
```

### Option 2: Using Docker Compose (Production)

**Start everything:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Or using make:**
```bash
make run-prod
```

**Access the application:**
- Application: http://localhost:8080
- All routes (frontend, API, WebSocket) served from port 8080

## What's Inside the Container

The single container includes:
1. **Frontend Build** (from `frontend/dist/`)
   - Optimized React production build
   - Static assets (JS, CSS, images)
   - Served by FastAPI at root path

2. **Backend Application**
   - FastAPI REST API at `/api/*`
   - Socket.IO WebSocket at `/socket.io/*`
   - Health check at `/health`
   - API docs at `/docs` and `/redoc`

3. **Static File Server**
   - Serves frontend assets from `/assets/*`
   - SPA fallback: all non-API routes return `index.html`

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `PORT` | Port to run the application | 8080 | No |
| `PYTHONUNBUFFERED` | Python output buffering | 1 | No |

### Example DATABASE_URL formats:

```bash
# Docker Compose (internal network)
DATABASE_URL=postgresql://user:password@postgres:5432/dbname

# External database
DATABASE_URL=postgresql://user:password@host.example.com:5432/dbname

# Cloud database (with SSL)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

## Deployment Platforms

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/code-collab-hub

# Deploy
gcloud run deploy code-collab-hub \
  --image gcr.io/PROJECT_ID/code-collab-hub \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="postgresql://..." \
  --port 8080
```

### AWS App Runner

```bash
# Create apprunner.yaml
# Then deploy via Console or CLI
aws apprunner create-service \
  --service-name code-collab-hub \
  --source-configuration file://apprunner-config.json
```

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create code-collab-hub

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
heroku container:push web
heroku container:release web

# Open
heroku open
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Deploy
railway up

# Add PostgreSQL
railway add postgresql

# Set environment variables in Railway dashboard
```

### Render

1. Connect your GitHub repository
2. Create new Web Service
3. Set:
   - Build Command: (Handled by Dockerfile)
   - Start Command: (Handled by Dockerfile)
   - Add PostgreSQL database
4. Deploy

### DigitalOcean App Platform

1. **Create App from GitHub**
2. **Configure**:
   - Dockerfile: `Dockerfile`
   - HTTP Port: `8080`
3. **Add Database**:
   - PostgreSQL Dev DB or Production DB
4. **Environment Variables**:
   - Set `DATABASE_URL` (auto-set if using DO database)

## Production Configuration

### 1. Create Environment File

```bash
cp .env.production.example .env.production
```

Edit `.env.production`:
```env
POSTGRES_USER=code_collab
POSTGRES_PASSWORD=STRONG_RANDOM_PASSWORD_HERE
POSTGRES_DB=code_collab_db
PORT=8080
```

### 2. Update CORS (Important!)

Edit `backend/main.py`:
```python
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Update this!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Use Production Database

Replace SQLite with PostgreSQL `DATABASE_URL` in production.

### 4. Build and Run

```bash
# Build
make build-prod

# Run with production compose
make run-prod

# Or with custom env file
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## Docker Commands Reference

```bash
# Build
docker build -t code-collab-hub:latest .
make build-prod

# Run production compose
docker-compose -f docker-compose.prod.yml up -d
make run-prod

# View logs
docker-compose -f docker-compose.prod.yml logs -f
make logs-prod

# Stop
docker-compose -f docker-compose.prod.yml down
make stop-prod

# Clean up (including database volumes)
docker-compose -f docker-compose.prod.yml down -v
make clean-prod

# Shell into container
docker exec -it code-collab-app bash
```

## Health Checks

The application includes health check endpoints:

```bash
# Basic health check
curl http://localhost:8080/health

# Should return: {"status": "ok"}
```

## Performance Optimization

### 1. Use Production ASGI Server

Update `Dockerfile` CMD to use Gunicorn with Uvicorn workers:

```dockerfile
RUN pip install gunicorn

CMD gunicorn main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8080
```

### 2. Add Requirements

```txt
# backend/requirements.txt
gunicorn==21.2.0
```

### 3. Enable Compression

Already handled by FastAPI/Uvicorn for JSON responses.
Static files are served efficiently.

### 4. Database Connection Pooling

SQLAlchemy's async engine handles connection pooling automatically.

## Security Checklist

- [ ] Change default database password
- [ ] Set proper CORS origins (not `["*"]`)
- [ ] Use HTTPS in production
- [ ] Set environment variables securely (not in code)
- [ ] Enable database SSL/TLS connections
- [ ] Use secrets management (not .env files in production)
- [ ] Regular security updates of base images
- [ ] Scan images for vulnerabilities: `docker scan code-collab-hub:latest`
- [ ] Use non-root user in Dockerfile (TODO)
- [ ] Implement rate limiting
- [ ] Add authentication/authorization

## Monitoring

### Logs

```bash
# Follow logs
docker logs -f code-collab-app

# Or with compose
make logs-prod
```

### Metrics

Consider adding:
- Application Performance Monitoring (APM): New Relic, Datadog
- Error Tracking: Sentry
- Uptime Monitoring: UptimeRobot, Pingdom

## Scaling

### Horizontal Scaling

The application is stateless (except database) and can be scaled:

```bash
# Scale to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

**Note**: WebSocket connections (Socket.IO) require sticky sessions or Redis adapter for multi-instance deployments.

### Adding Redis for WebSocket (Advanced)

For true horizontal scaling with WebSockets:

1. Add Redis service
2. Update Socket.IO to use Redis adapter
3. All instances share WebSocket state

## Backup and Recovery

### Database Backup

```bash
# Backup
docker exec postgres pg_dump -U code_collab code_collab_db > backup.sql

# Restore
cat backup.sql | docker exec -i postgres psql -U code_collab -d code_collab_db
```

### Automated Backups

Set up cron jobs or use cloud provider's automated backup features.

## Troubleshooting

### Frontend Not Loading

```bash
# Check if static files exist inside container
docker exec -it code-collab-app ls -la /app/static

# Should see: index.html, assets/, etc.
```

### Database Connection Failed

```bash
# Test database connection
docker exec -it code-collab-app python -c "from database import engine; import asyncio; asyncio.run(engine.connect())"
```

### Port Already in Use

```bash
# Change port in docker-compose.prod.yml
ports:
  - "8081:8080"  # External:Internal
```

## CI/CD Example

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build image
        run: docker build -t code-collab-hub:latest .
      
      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push code-collab-hub:latest
      
      - name: Deploy
        run: |
          # Your deployment commands
```

## Cost Optimization

### Use Smaller Base Images

The Dockerfile already uses:
- `node:18-alpine` (smaller Node image)
- `python:3.12-slim` (smaller Python image)

### Multi-stage Build Benefits

- Frontend build artifacts discarded
- Only production files in final image
- Smaller image = faster deploys, lower costs

## Comparison: Single Container vs Multi-Container

| Aspect | Single Container | Multi-Container (nginx) |
|--------|------------------|-------------------------|
| Complexity | Low | Medium |
| Deployment Platforms | More options | Fewer options |
| Scaling | Simple | More flexible |
| Resources | Lower | Higher |
| Separation | Less | More |
| Best For | Most deployments | High-traffic apps |

## Next Steps

1. Deploy to staging environment
2. Test all features
3. Set up monitoring
4. Configure backups
5. Deploy to production
6. Set up CI/CD

## Support

For issues specific to single-container deployment:
- Check logs: `make logs-prod`
- Verify build: `docker build .`
- Test locally first before deploying

For general deployment issues, see `DEPLOYMENT.md`.
