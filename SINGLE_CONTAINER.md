# 🚀 Single Container Deployment - Complete!

## What's Been Created

Your Code Collaboration Hub now supports **single-container deployment** where the frontend and backend are combined into one Docker image!

### 📦 New Files

| File | Purpose |
|------|---------|
| **`Dockerfile`** | Multi-stage build: Frontend (Node) → Backend (Python) with static files |
| **`docker-compose.prod.yml`** | Production setup with combined container + PostgreSQL |
| **`.dockerignore`** | Optimizes build by excluding unnecessary files |
| **`.env.production.example`** | Production environment template |
| **`PRODUCTION.md`** | Comprehensive deployment guide for various platforms |

### 🔧 Modified Files

| File | Changes |
|------|---------|
| **`backend/main.py`** | Added static file serving and SPA fallback routing |
| **`Makefile`** | Added `build-prod`, `run-prod`, `stop-prod`, `logs-prod` commands |

## 🏗️ Architecture

### Single Container Contains:
```
┌─────────────────────────────────┐
│  Code Collab Hub Container      │
│                                  │
│  FastAPI Backend (Port 8080)    │
│  ├─ /api/*      → REST API      │
│  ├─ /socket.io  → WebSocket     │
│  ├─ /health     → Health Check  │
│  ├─ /docs       → API Docs      │
│  ├─ /assets/*   → Static Assets │
│  └─ /*          → React SPA     │
│                                  │
│  Frontend Static Files          │
│  └─ Built with Vite (optimized) │
└─────────────────────────────────┘
```

## 🚀 Quick Start

### Build the Image

```bash
# Using Docker
docker build -t code-collab-hub:latest .

# Using Make
make build-prod
```

### Run with Docker Compose

```bash
# Start production setup
make run-prod

# View logs
make logs-prod

# Stop
make stop-prod
```

### Access the Application

- **Everything on port 8080**: http://localhost:8080
  - Frontend: `/`
  - API: `/api/*`
  - WebSocket: `/socket.io`
  - Health: `/health`
  - Docs: `/docs`

## 🎯 How It Works

### 1. Multi-Stage Build

**Stage 1 (frontend-builder):**
- Uses `node:18-alpine`
- Builds React app with Vite
- Outputs to `/frontend/dist`

**Stage 2 (final):**
- Uses `python:3.12-slim`
- Installs backend dependencies
- Copies backend code
- **Copies built frontend from Stage 1** → `/app/static`

### 2. Static File Serving

FastAPI automatically serves:
- **Static assets**: `/assets/*` → `/app/static/assets/`
- **SPA routing**: `/*` → `/app/static/index.html` (except API routes)

### 3. API & WebSocket

All API and WebSocket routes work normally:
- `/api/rooms` → REST endpoints
- `/socket.io` → Real-time WebSocket

## 📊 Deployment Platforms

### ☁️ Google Cloud Run

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/code-collab-hub
gcloud run deploy --image gcr.io/PROJECT_ID/code-collab-hub --port 8080
```

### 🚂 Railway

```bash
railway login
railway init
railway up
```

### 🎨 Render

1. Connect GitHub repo
2. Select "Dockerfile"
3. Set port to `8080`
4. Add PostgreSQL database
5. Deploy!

### 🐳 Heroku

```bash
heroku container:push web
heroku container:release web
```

See **`PRODUCTION.md`** for detailed platform-specific instructions!

## 🆚 Single vs Multi-Container

### Single Container (New!)
✅ **Pros:**
- Simpler deployment
- Works on more platforms (Cloud Run, Railway, etc.)
- Lower resource usage
- Easier to manage
- **Perfect for most use cases**

❌ **Cons:**
- Less separation of concerns
- Harder to scale frontend/backend independently

### Multi-Container (Existing)
✅ **Pros:**
- Better separation
- Can scale services independently
- Nginx optimizations

❌ **Cons:**
- More complex
- Requires Docker Compose or Kubernetes
- Higher resource usage

## 🔐 Production Checklist

Before deploying:

- [ ] Update CORS origins in `backend/main.py` (change from `["*"]`)
- [ ] Set strong database password in `.env.production`
- [ ] Configure `DATABASE_URL` for your database
- [ ] Test the build locally: `make build-prod`
- [ ] Test the container: `make run-prod`
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Enable HTTPS (handled by platform usually)

## 🛠️ Commands Reference

```bash
# Build
make build-prod
docker build -t code-collab-hub:latest .

# Run (with PostgreSQL)
make run-prod
docker-compose -f docker-compose.prod.yml up -d

# Logs
make logs-prod
docker-compose -f docker-compose.prod.yml logs -f

# Stop
make stop-prod
docker-compose -f docker-compose.prod.yml down

# Clean (remove data)
make clean-prod
docker-compose -f docker-compose.prod.yml down -v

# Test locally
docker run -p 8080:8080 \
  -e DATABASE_URL=postgresql://user:pass@host/db \
  code-collab-hub:latest
```

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |
| `PORT` | ❌ No | 8080 | Application port |
| `PYTHONUNBUFFERED` | ❌ No | 1 | Python output buffering |

## 🧪 Testing the Build

```bash
# Build the image
docker build -t code-collab-hub:test .

# Run with test database
docker run -d --name postgres-test \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=testdb \
  postgres:15-alpine

# Run the app
docker run -d --name app-test \
  -p 8080:8080 \
  --link postgres-test \
  -e DATABASE_URL=postgresql://postgres:test@postgres-test/testdb \
  code-collab-hub:test

# Test it
curl http://localhost:8080/health
curl http://localhost:8080/

# Clean up
docker stop app-test postgres-test
docker rm app-test postgres-test
```

## 🎉 What's Changed from Multi-Container?

### Deployment Setup

**Before (Multi-Container):**
- 3 services: Nginx, Backend, Postgres
- `docker-compose.yml` with 3 containers
- Port 80 (nginx) → Port 3001 (backend)

**Now (Single Container):**
- 2 services: App (frontend+backend), Postgres
- `docker-compose.prod.yml` with 1 app container
- Port 8080 → Everything

### File Serving

**Before:**
- Nginx serves frontend static files
- Nginx proxies `/api` to backend
- Nginx proxies `/socket.io` to backend

**Now:**
- FastAPI serves everything:
  - Static files at `/assets/*`
  - SPA fallback at `/*`
  - API at `/api/*`
  - WebSocket at `/socket.io`

## 📚 Documentation

- **`PRODUCTION.md`** - Full production deployment guide
- **`DEPLOYMENT.md`** - Multi-container deployment
- **`DOCKER.md`** - Development Docker setup
- **`README.md`** - General project info

## ✅ Next Steps

1. **Test locally:**
   ```bash
   make build-prod
   make run-prod
   ```

2. **Access**: http://localhost:8080

3. **Choose deployment platform** (see PRODUCTION.md)

4. **Deploy to staging first**

5. **Test everything works**

6. **Deploy to production** 🚀

---

**You now have TWO deployment options:**
1. **Single Container** (`Dockerfile` + `docker-compose.prod.yml`) - **Recommended for most deployments**
2. **Multi-Container** (`docker-compose.yml`) - For development or complex setups

Both work perfectly! Choose based on your needs. 🎉
