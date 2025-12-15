# 🚀 Render Deployment - Quick Start

## ⚡ Fast Track (5 Minutes to Deploy)

### Step 1: Prepare Your Code

```bash
# Make sure you're in the project root
cd /workspaces/code-collab-hub

# Update CORS for production (IMPORTANT!)
# Edit backend/main.py - Replace line 33:
#   allow_origins=["*"]
# With your Render URL (you'll get this after first deploy, so skip for now)
```

### Step 2: Commit Everything

```bash
# Stage all files
git add .

# Commit
git commit -m "Add Render deployment configuration"

# Push to GitHub
git push origin main
```

### Step 3: Deploy on Render

1. **Go to**: https://dashboard.render.com/select-repo

2. **Connect GitHub**:
   - Click "Connect account" for GitHub
   - Authorize Render
   - Select your repository

3. **Choose Deployment Method**:
   
   **Option A: Blueprint (Easiest - Recommended)** ⭐
   - Render will detect `render.yaml`
   - Click "Apply"
   - Everything deploys automatically!
   
   **Option B: Manual**
   - Click "New +" → "Blueprint"
   - Select your repo
   - Click "Apply"

4. **Wait for Deployment** (~5-10 minutes)
   - Watch the logs
   - PostgreSQL database creates first
   - Then web service builds and deploys

5. **Get Your URL**
   - Once live, you'll see: `https://code-collab-hub-XXXX.onrender.com`
   - Click it to access your app!

### Step 4: Test It

```bash
# Check health
curl https://your-app-url.onrender.com/health

# Should return: {"status":"ok"}
```

**That's it! Your app is live! 🎉**

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [x] ✅ Code is on GitHub
- [x] ✅ `render.yaml` exists in repo root
- [x] ✅ `Dockerfile` exists in repo root
- [ ] ⬜ Update CORS after first deploy (see below)
- [ ] ⬜ Test locally: `make build-prod && make run-prod`

---

## ⚠️ Important: Update CORS After First Deploy

After your first successful deployment:

1. **Note your Render URL**: `https://code-collab-hub-XXXX.onrender.com`

2. **Update `backend/main.py`** line 33-36:

   ```python
   # Before (current):
   fastapi_app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # Allow all (not secure!)
       ...
   )
   
   # After (secure):
   fastapi_app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://code-collab-hub-XXXX.onrender.com",  # Your actual URL
           "http://localhost:3000",  # For local dev
       ],
       ...
   )
   ```

3. **Commit and push**:
   ```bash
   git add backend/main.py
   git commit -m "Update CORS for production"
   git push
   ```

4. **Render auto-deploys** - No other action needed!

---

## 🎯 What Gets Deployed

When you deploy, Render will:

1. **Create PostgreSQL Database**
   - Name: `code-collab-db`
   - Free tier (90-day limit)
   - Auto-configured connection string

2. **Build Your Docker Container**
   - Builds React frontend
   - Builds Python backend
   - Combines them into one container

3. **Deploy Web Service**
   - Runs on port 8080
   - Serves everything from one URL
   - Auto-SSL (HTTPS)
   - Health checks enabled

---

## 💰 Pricing

### Free Tier (Great for Testing)
- ✅ Free PostgreSQL (90 days)
- ✅ Free web service (spins down after 15 min)
- ⚠️ Slow first request after inactivity (~30-60s)

### Production (Recommended)
- 💵 **$7/month** - Web service (always on)
- 💵 **$7/month** - PostgreSQL (persistent)
- 💵 **$14/month** - Total

---

## 🐛 Troubleshooting

### Build Failed?

```bash
# Test build locally first:
docker build -t test .

# Fix any errors, then:
git add .
git commit -m "Fix build issues"
git push
```

### Can't Access App?

1. Check deployment status in Render dashboard
2. Check logs for errors
3. Verify health endpoint: `https://your-url.onrender.com/health`

### Database Connection Error?

1. Verify PostgreSQL service is "Available" in dashboard
2. Check `DATABASE_URL` env var is set
3. Check logs for specific error

---

## 📞 Need Help?

1. **Read full guide**: `RENDER_DEPLOY.md`
2. **Render docs**: https://render.com/docs
3. **Check logs**: Render Dashboard → Your Service → Logs
4. **Test locally**: `make build-prod && make run-prod`

---

## ✅ After Deployment

Once your app is live:

1. ✅ Update CORS settings (see above)
2. ✅ Test all features:
   - Create a room
   - Join a room
   - Real-time editing
   - Code execution
3. ✅ Consider upgrading to paid plan for production
4. ✅ Set up custom domain (optional)
5. ✅ Set up monitoring

---

## 🎉 You're Ready!

Everything is configured. Just:

```bash
git push origin main
```

Then go to https://dashboard.render.com and deploy!

**Your app will be live in ~10 minutes! 🚀**
