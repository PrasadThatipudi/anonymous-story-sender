# Getting Started Guide

Welcome! This guide will help you set up and run the Anonymous Story Submission Platform locally.

## ✅ What You'll Need

1. **Deno** - [Install here](https://deno.land/manual/getting_started/installation)
2. **Node.js & npm** - [Install here](https://nodejs.org/)
3. **Neon PostgreSQL Account** - [Sign up here](https://neon.tech) (Free)
4. **Gmail Account** with App Password

## 🚀 Quick Setup (5 Minutes)

### Step 1: Setup Database (2 min)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string (looks like `postgresql://...`)

### Step 2: Configure Backend (1 min)

```bash
cd backend

# Create environment file
cp .env.example .env

# Open .env and update:
# - DATABASE_URL with your Neon connection string
# - GMAIL_USER with your Gmail address
# - GMAIL_APP_PASSWORD (see Gmail setup below)
# - MANAGER_EMAILS with your email
```

### Step 3: Setup Gmail SMTP (2 min)

1. Enable 2-factor auth on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create an app password for "Mail"
4. Copy the 16-character password to your `.env` file

### Step 4: Initialize Database

```bash
cd backend

# Generate Prisma client
deno task generate

# Run database migrations
deno task migrate

# Create your manager account
deno run --allow-all scripts/create-manager.ts
# Enter your email and password when prompted
```

### Step 5: Start Everything

**Terminal 1 - Backend:**
```bash
cd backend
deno task dev
# Server starts at http://localhost:8000
```

**Terminal 2 - Viewer Frontend:**
```bash
cd frontend/packages/viewer
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env
npm install
npm run dev
# Viewer starts at http://localhost:5173
```

**Terminal 3 - Manager Frontend:**
```bash
cd frontend/packages/manager
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env
npm install
npm run dev
# Manager starts at http://localhost:5174
```

## 🎉 You're Ready!

### Test the Viewer App
1. Open http://localhost:5173
2. Write a test story
3. Click "Submit Your Story"
4. Check your email for notification! 📧

### Test the Manager App
1. Open http://localhost:5174
2. Login with the credentials you created
3. View your submitted story
4. Try updating status, adding notes
5. Test the export feature

## 📁 Project Structure

```
anonymous-story-sender/
├── backend/                    # Hono + Deno API
│   ├── src/
│   │   ├── domain/            # Business entities
│   │   ├── application/       # Services & logic
│   │   ├── infrastructure/    # Database & email
│   │   └── presentation/      # API routes
│   ├── scripts/               # Utility scripts
│   └── tests/                 # Unit tests
│
├── frontend/
│   └── packages/
│       ├── viewer/            # Public story submission
│       └── manager/           # Manager dashboard
│
├── README.md                  # Overview
├── DEPLOYMENT.md              # Production deployment
└── GETTING_STARTED.md         # This file
```

## 🔧 Common Issues

### "Connection refused" error
- Make sure backend is running on port 8000
- Check that .env files in frontend have correct API URL

### Email not sending
- Verify Gmail App Password is correct (16 characters, no spaces)
- Check that 2-factor auth is enabled on Gmail
- Review backend console for SMTP errors

### Database connection error
- Verify DATABASE_URL in backend/.env
- Make sure Neon project is active
- Try regenerating the connection string

### Frontend build errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

## 🧪 Running Tests

```bash
cd backend
deno task test
```

## 📚 Next Steps

1. **Customize the UI**: Edit colors in `tailwind.config.js`
2. **Add Features**: Check out the architecture in `/backend/src/`
3. **Deploy to Production**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)

## 🆘 Need Help?

1. Check the detailed [README.md](README.md)
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
3. Check backend logs in the terminal
4. Review browser console for frontend errors

## 🎨 Customization Ideas

- Change the color scheme in Tailwind configs
- Add more story statuses
- Implement story categories
- Add file attachments
- Create custom email templates
- Add analytics dashboard

## 🔒 Security Features

✅ All implemented and ready:
- Bcrypt password hashing
- JWT authentication
- Rate limiting (5 login attempts, 10 stories/hour)
- CORS protection
- Security headers (CSP, HSTS, etc.)
- Input validation with Zod
- PII-safe logging
- SQL injection prevention via Prisma

Enjoy building your story platform! 🚀

