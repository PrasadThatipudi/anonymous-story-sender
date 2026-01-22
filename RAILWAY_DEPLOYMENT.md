# Railway Deployment Guide

## Quick Start

Your backend is now containerized with Docker and ready to deploy to Railway!

## Prerequisites

- GitHub account with this repository
- Railway account (sign up at https://railway.app)
- Your Neon PostgreSQL DATABASE_URL

## Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub

## Step 2: Deploy from GitHub

### Option A: Via Railway Dashboard (Recommended)

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `anonymous-story-sender` repository
4. Railway will auto-detect the Dockerfile
5. Click "Deploy"

### Option B: Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your repository
railway init

# Deploy
railway up
```

## Step 3: Add Environment Variables

In Railway dashboard:

1. Go to your project
2. Click on the service
3. Go to "Variables" tab
4. Add the following:

```
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=24h
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,https://your-frontend.vercel.app
PORT=8000
NODE_ENV=production
FRONTEND_MANAGER_URL=https://your-manager-frontend.vercel.app
```

### Optional Bootstrap Variables (only for initial setup):
```
BOOTSTRAP_ADMIN_EMAIL=admin@yourcompany.com
BOOTSTRAP_ADMIN_PASSWORD=your-secure-password
```

## Step 4: Get Your Railway URL

1. After deployment completes, Railway provides a public URL
2. It looks like: `https://your-app.railway.app`
3. Copy this URL

## Step 5: Update Frontend Environment Variables

Update your frontend packages to use the Railway backend URL:

### Viewer Frontend (.env):
```
VITE_API_BASE_URL=https://your-app.railway.app/api
```

### Manager Frontend (.env):
```
VITE_API_BASE_URL=https://your-app.railway.app/api
```

### Update on Vercel:
1. Go to each frontend project on Vercel
2. Settings → Environment Variables
3. Update `VITE_API_BASE_URL` to your Railway URL
4. Redeploy frontends

## Step 6: Update CORS_ORIGINS

Back in Railway, update `CORS_ORIGINS` to include your frontend URLs:

```
CORS_ORIGINS=https://viewer.vercel.app,https://manager.vercel.app
```

(Replace with your actual Vercel URLs)

## Step 7: Run Database Migrations

Railway has a console feature:

1. Go to your service
2. Click "Console" or "Shell"
3. Run:
```bash
deno task migrate
```

Or set up a one-time deployment command in Railway settings.

## Monitoring & Logs

- **View Logs**: Click "Deployments" → Select deployment → View logs
- **Metrics**: Railway dashboard shows CPU, memory usage
- **Costs**: Dashboard shows current usage (likely $2-4/month, within free $5 credit)

## Troubleshooting

### Build Fails

Check Railway build logs. Common issues:
- Missing environment variables
- Dockerfile syntax errors

### App Won't Start

1. Check logs for errors
2. Verify DATABASE_URL is correct
3. Ensure all required env vars are set

### Can't Connect to Database

- Verify DATABASE_URL is the correct Neon connection string
- Check Neon database is running
- Ensure Railway has network access (it should by default)

## Automatic Deployments

Railway automatically deploys when you push to `main` branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway detects the push and redeploys automatically.

## Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS setup instructions

## Cost Estimation

With Railway's $5/month free credit:

- **Typical usage**: $2-4/month
- **Your cost**: $0 (stays within free credit)
- **Only pay if**: You exceed $5/month usage

## Alternative: Manual Docker Deploy

If you prefer running Docker locally:

```bash
# Build
docker build -t anonymous-story-backend ./backend

# Run
docker run -p 8000:8000 --env-file ./backend/.env anonymous-story-backend
```

## Summary

✅ Backend containerized with Docker  
✅ Deploys to Railway with one click  
✅ Auto-deploys on git push  
✅ Effectively free with $5 credit  
✅ No edge runtime issues  
✅ Full Prisma support  

Your backend is now production-ready!

