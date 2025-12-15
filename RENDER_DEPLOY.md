# Deploy to Render - Step-by-Step Guide

## 🎯 Quick Overview

Render will:
- ✅ Build your Docker container automatically
- ✅ Provision a PostgreSQL database (free tier available)
- ✅ Deploy and host your application
- ✅ Provide HTTPS automatically
- ✅ Auto-deploy on every git push

**Total Time**: ~10 minutes  
**Cost**: Free tier available (with limitations)

---

## 📋 Prerequisites

1. ✅ GitHub account
2. ✅ Render account (sign up at https://render.com)
3. ✅ Your code pushed to GitHub
4. ✅ `render.yaml` file in your repository (already created!)

---

## 🚀 Deployment Steps

### Option 1: Using Blueprint (Recommended - Automated)

This deploys EVERYTHING with one click using the `render.yaml` file.

#### Step 1: Push to GitHub

```bash
# If you haven't already
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

#### Step 2: Deploy via Render Dashboard

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** (top right)
3. **Select "Blueprint"**
4. **Connect your GitHub repository**
   - Click "Connect" next to GitHub
   - Authorize Render to access your repositories
   - Select your `code-collab-hub` repository
5. **Render will detect `render.yaml`**
   - Review the services it will create
   - Click "Apply"
6. **Wait for deployment** (~5-10 minutes)
   - Database will provision first
   - Then web service will build and deploy

#### Step 3: Access Your App

Once deployed:
- Your app URL: `https://code-collab-hub.onrender.com` (or similar)
- Check deployment logs for the exact URL

**That's it!** ✨

---

### Option 2: Manual Setup (Step-by-step)

If you prefer manual control:

#### Step 1: Create PostgreSQL Database

1. **Dashboard** → **New +** → **PostgreSQL**
2. **Configure**:
   - Name: `code-collab-db`
   - Database: `code_collab_db`
   - User: `code_collab`
   - Region: Choose closest to you
   - Plan: **Free** (or paid for production)
3. **Create Database**
4. **Copy the connection details** (you'll need "Internal Database URL")

#### Step 2: Create Web Service

1. **Dashboard** → **New +** → **Web Service**
2. **Connect Repository**:
   - Select your GitHub repository
   - Branch: `main`
3. **Configure Service**:
   - Name: `code-collab-hub`
   - Region: Same as database
   - Runtime: **Docker**
   - Dockerfile Path: `Dockerfile`
   - Docker Context: `.` (root)
4. **Plan**: Free (or paid for production)
5. **Advanced Settings**:
   - Health Check Path: `/health`
   - Port: `8080` (should auto-detect from Dockerfile)
6. **Environment Variables**:
   ```
   DATABASE_URL = [paste Internal Database URL from Step 1]
   PORT = 8080
   PYTHONUNBUFFERED = 1
   ```
7. **Create Web Service**

#### Step 3: Wait for Build

- First deployment takes ~5-10 minutes
- Watch the logs in the dashboard
- Build stages:
  1. Building frontend (Node)
  2. Building backend (Python)
  3. Starting application

#### Step 4: Verify Deployment

Once "Live":
1. Click the URL (e.g., `https://code-collab-hub.onrender.com`)
2. Check `/health` endpoint returns `{"status": "ok"}`
3. Test creating a room

---

## 🔧 Configuration Details

### Free Tier Limitations

- ⚠️ **Web Service**: Spins down after 15 minutes of inactivity
  - First request after inactivity will be slow (~30-60 seconds)
  - Fine for demos/testing, not for production
- ⚠️ **Database**: 90 day expiration
  - Data is deleted after 90 days
  - Upgrade to paid plan for persistence
- ⚠️ **Build Time**: Slower builds on free tier

### Upgrade to Paid Plan

For production use, upgrade to at least:
- **Starter** plan ($7/month) for web service
- **Starter** plan ($7/month) for PostgreSQL

Benefits:
- ✅ No spin-down
- ✅ Persistent database
- ✅ Faster build times
- ✅ More resources

---

## 🔐 Environment Variables

The `render.yaml` automatically configures these, but if you're doing manual setup:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Auto (from database) | PostgreSQL connection string |
| `PORT` | `8080` | Application port |
| `PYTHONUNBUFFERED` | `1` | Python logging |

### Important: CORS Configuration

⚠️ **Before deploying**, update CORS in `backend/main.py`:

```python
# Change this:
allow_origins=["*"]

# To this (use your actual Render URL):
allow_origins=[
    "https://code-collab-hub.onrender.com",
    "http://localhost:3000",  # For local development
]
```

Commit and push this change!

---

## 🚦 Health Checks

Render automatically pings `/health` every few minutes:
- Returns `{"status": "ok"}` when healthy
- Auto-restarts if unhealthy

---

## 📊 Monitoring & Logs

### View Logs

1. Go to your web service in Render dashboard
2. Click "Logs" tab
3. Real-time logs stream here

### Useful log commands:

```bash
# See what's happening during build
# (Watch "Logs" tab during deployment)

# Common things to check:
# - "Building frontend..." - Frontend build stage
# - "Installing backend dependencies..." - Python packages
# - "Starting application..." - Uvicorn startup
```

### Metrics

1. Dashboard → Your Service → "Metrics"
2. See:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## 🔄 Auto-Deploy

With Blueprint (`render.yaml`):
- ✅ Automatically deploys on every `git push` to `main`
- ✅ No manual intervention needed
- ✅ Rollback available in dashboard

To disable auto-deploy:
1. Service Settings → "Auto-Deploy"
2. Toggle off

---

## 🐛 Troubleshooting

### Build Fails

**Check Docker Build Locally First:**
```bash
docker build -t code-collab-hub:test .
```

**Common Issues:**
- Missing files: Check `.dockerignore` isn't excluding needed files
- Frontend build errors: Check `frontend/package.json` scripts
- Backend dependencies: Check `backend/requirements.txt`

**Fix and redeploy:**
```bash
git add .
git commit -m "Fix build issue"
git push
```

### Service Won't Start

**Check Logs:**
1. Render Dashboard → Your Service → Logs
2. Look for error messages

**Common Issues:**

**Database Connection Failed:**
```
Error: could not connect to database
```
**Fix:** Check `DATABASE_URL` environment variable is set correctly

**Port Issues:**
```
Error: Address already in use
```
**Fix:** Ensure Dockerfile uses `PORT` env var (already configured)

**Import Errors:**
```
ModuleNotFoundError: No module named 'X'
```
**Fix:** Add missing package to `backend/requirements.txt`

### App is Slow on First Request

**Expected behavior on free tier:**
- Service spins down after 15 min inactivity
- First request wakes it up (~30-60 seconds)
- Subsequent requests are fast

**Solution:** Upgrade to paid plan for 24/7 uptime

### Database Connection Errors

**Verify database is running:**
1. Dashboard → PostgreSQL service
2. Should show "Available"

**Test connection:**
```bash
# From Render shell (Dashboard → Service → Shell)
python -c "from database import engine; import asyncio; asyncio.run(engine.connect())"
```

---

## 🔒 Security Best Practices

### Before Production:

1. **Update CORS Origins**
   ```python
   # backend/main.py
   allow_origins=["https://your-actual-domain.com"]
   ```

2. **Set Strong DB Password**
   - Render auto-generates secure passwords ✅

3. **Enable SSL** (Automatic on Render ✅)

4. **Use Secrets**
   - Render encrypts environment variables ✅

5. **Regular Updates**
   ```bash
   # Update dependencies periodically
   pip install --upgrade -r requirements.txt
   npm update
   ```

---

## 📈 Scaling

### Horizontal Scaling

Render supports multiple instances:
1. Dashboard → Service → Settings
2. Increase instance count
3. Render handles load balancing

⚠️ **Note**: WebSocket (Socket.IO) requires sticky sessions or Redis adapter for multi-instance

### Vertical Scaling

Upgrade to larger instance types:
- Standard: More CPU/RAM
- Pro: Even more resources

---

## 💰 Cost Estimate

### Free Tier (Perfect for Testing)
- Web Service: Free (with spin-down)
- PostgreSQL: Free (90-day expiration)
- **Total**: $0/month

### Production Setup (Recommended)
- Web Service (Starter): $7/month
- PostgreSQL (Starter): $7/month
- **Total**: $14/month

### High Traffic Setup
- Web Service (Standard): $25/month
- PostgreSQL (Standard): $20/month
- **Total**: $45/month

---

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Support**: https://render.com/support

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Test creating a room
- [ ] Test joining a room
- [ ] Test real-time code editing
- [ ] Test WebSocket connection
- [ ] Test code execution
- [ ] Check health endpoint: `/health`
- [ ] Check API docs: `/docs`
- [ ] Update CORS settings
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring alerts
- [ ] Plan for database backups

---

## 🎉 Success!

Your app is now live! Share your Render URL:
```
https://code-collab-hub.onrender.com
```

### Next Steps:

1. **Custom Domain** (Optional)
   - Dashboard → Service → Settings → Custom Domains
   - Add your domain
   - Update DNS records

2. **Monitoring**
   - Set up UptimeRobot or similar
   - Monitor `/health` endpoint

3. **Backups**
   - Render auto-backs up paid PostgreSQL
   - Or set up your own backup script

4. **Performance**
   - Monitor dashboard metrics
   - Upgrade plan if needed

---

## 🆘 Need Help?

1. Check Render documentation
2. Review deployment logs
3. Test locally with `make build-prod && make run-prod`
4. Check GitHub issues
5. Contact Render support (great response times!)

---

**Happy Deploying! 🚀**
