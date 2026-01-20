# Deployment Guide

This guide will help you deploy your Anonymous Story Submission Platform to production.

## Prerequisites

1. **Neon PostgreSQL Account** - [https://neon.tech](https://neon.tech) (Free tier available)
2. **Gmail Account** with App Password
3. **Deno Deploy Account** - [https://deno.com/deploy](https://deno.com/deploy) (Free tier available)
4. **Vercel or Netlify Account** for frontend hosting (Free tier available)

## Step 1: Setup Neon PostgreSQL Database

### 1.1 Create Database

1. Sign up at [https://neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 1.2 Run Database Migrations

```bash
cd backend
# Create .env file with your Neon DATABASE_URL
echo 'DATABASE_URL="your-neon-connection-string"' > .env

# Generate Prisma client
deno task generate

# Run migrations
deno task migrate
```

### 1.3 Create First Manager Account

```bash
deno run --allow-all scripts/create-manager.ts
```

## Step 2: Setup Gmail SMTP

### 2.1 Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Factor Authentication

### 2.2 Generate App Password

1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Name it "Story Platform"
4. Copy the 16-character password

### 2.3 Update Environment Variables

Add to your `.env`:
```bash
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
```

## Step 3: Deploy Backend to Deno Deploy

### 3.1 Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 3.2 Deploy to Deno Deploy

1. Go to [https://dash.deno.com/projects](https://dash.deno.com/projects)
2. Click "New Project"
3. Connect your GitHub repository
4. Set entry point: `backend/src/main.ts`
5. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET` (generate a strong 32+ character secret)
   - `JWT_EXPIRY` = "24h"
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `BOOTSTRAP_ADMIN_EMAIL` (Optional - only for initial setup)
   - `BOOTSTRAP_ADMIN_PASSWORD` (Optional - only for initial setup)
   - `FRONTEND_MANAGER_URL` (will update after frontend deployment)
   - `CORS_ORIGINS` (will update after frontend deployment)
   - `PORT` = "8000"
   - `NODE_ENV` = "production"

6. Deploy!

Your API will be available at: `https://your-project.deno.dev`

## Step 4: Deploy Frontend (Viewer)

### 4.1 Update Environment Variables

Create `frontend/packages/viewer/.env`:
```bash
VITE_API_BASE_URL=https://your-project.deno.dev/api
```

### 4.2 Deploy to Vercel

```bash
cd frontend/packages/viewer

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Follow the prompts. Your viewer app will be available at a Vercel URL.

## Step 5: Deploy Frontend (Manager)

### 5.1 Update Environment Variables

Create `frontend/packages/manager/.env`:
```bash
VITE_API_BASE_URL=https://your-project.deno.dev/api
```

### 5.2 Deploy to Vercel

```bash
cd frontend/packages/manager

# Deploy
vercel
```

Your manager app will be available at a separate Vercel URL.

## Step 6: Update CORS Settings

### 6.1 Update Backend Environment

Go back to your Deno Deploy project settings and update `CORS_ORIGINS`:

```bash
CORS_ORIGINS="https://your-viewer-app.vercel.app,https://your-manager-app.vercel.app"
```

Redeploy the backend if needed.

## Step 7: Test Everything

### 7.1 Test Viewer App

1. Visit your viewer app URL
2. Submit a test story
3. Check that you receive an email notification

### 7.2 Test Manager App

1. Visit your manager app URL
2. Login with the manager account you created
3. View the submitted story
4. Test updating status and adding notes
5. Test deletion
6. Test export (JSON and CSV)

## Maintenance

### Database Backups

Neon automatically backs up your database. You can also:

1. Export data via the manager app's export feature
2. Use Neon's branching feature for staging environments
3. Schedule regular exports using cron jobs

### Monitoring

1. **Deno Deploy Dashboard**: Monitor API requests, errors, and performance
2. **Email Logs**: Check that email notifications are being sent
3. **Database Stats**: Use Prisma Studio to check database state:
   ```bash
   deno task studio
   ```

### Scaling

The free tiers should handle:
- Neon: 10 GB storage
- Deno Deploy: 100k requests/month
- Vercel: Unlimited bandwidth

For higher traffic:
- Upgrade Neon for more storage
- Upgrade Deno Deploy for more requests
- Consider adding Redis for rate limiting
- Add database connection pooling

## Security Checklist

- ✅ Strong JWT_SECRET (32+ characters)
- ✅ HTTPS only (enforced by Deno Deploy)
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Passwords hashed with bcrypt
- ✅ PII-safe logging
- ✅ Email notifications working
- ✅ Manager accounts secured

## Troubleshooting

### Backend Issues

**Problem**: API not responding
- Check Deno Deploy logs
- Verify environment variables are set
- Test database connection

**Problem**: Email not sending
- Verify Gmail App Password is correct
- Check that managers exist in the database
- Review logs for SMTP errors

### Frontend Issues

**Problem**: API requests failing
- Check CORS_ORIGINS in backend
- Verify VITE_API_BASE_URL is correct
- Check browser console for errors

**Problem**: Authentication not working
- Clear browser localStorage
- Verify JWT_SECRET is consistent
- Check backend auth logs

## Support

For issues:
1. Check the logs in Deno Deploy dashboard
2. Review error messages in browser console
3. Test API endpoints with curl or Postman
4. Check database state with Prisma Studio

## Cost Estimate

Using free tiers:
- Neon PostgreSQL: $0
- Deno Deploy: $0
- Vercel (2 apps): $0
- Gmail SMTP: $0

**Total: $0/month** for moderate usage

Paid upgrades only needed for high traffic (1000+ stories/day)

