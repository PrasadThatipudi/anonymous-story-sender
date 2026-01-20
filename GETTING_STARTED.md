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

### Step 2: Configure Backend (2 min)

```bash
cd backend

# Create environment file
cp .env.example .env
```

Open `.env` and update these required variables:

```bash
# Database
DATABASE_URL=your_neon_connection_string_here

# Gmail SMTP
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# JWT Security
JWT_SECRET=generate_a_random_32_character_string_here
JWT_EXPIRY=24h

# Bootstrap Admin (Your First Admin Account)
BOOTSTRAP_ADMIN_EMAIL=admin@yourcompany.com
BOOTSTRAP_ADMIN_PASSWORD=YourSecurePassword123!

# Frontend URL (for invitation emails)
FRONTEND_MANAGER_URL=http://localhost:5174

# Server
PORT=8000
NODE_ENV=development
```

> 💡 **Tip:** The bootstrap admin account is created automatically when you run migrations for the first time. Use these credentials to log in to the manager dashboard.

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

# Run database migrations (this also creates your bootstrap admin)
deno task migrate

# The seed script automatically creates your first admin account
# using BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD from .env
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

#### Login as Bootstrap Admin
1. Open http://localhost:5174
2. Login with your bootstrap admin credentials:
   - Email: The one you set in `BOOTSTRAP_ADMIN_EMAIL`
   - Password: The one you set in `BOOTSTRAP_ADMIN_PASSWORD`
3. You'll see the full admin dashboard

#### Test Admin Features
1. View submitted stories
2. Update story status and add notes
3. Export stories (Admin only)
4. **Test Team Management:**
   - Click "Invite Manager" in the Team Management section
   - Enter an email and select role (Admin or Manager)
   - Check that email for the invitation link

#### Test Invitation Flow
1. Open the invitation email
2. Click the invitation link
3. Set your password
4. You'll be automatically logged in
5. If you invited as "Manager" (not Admin), notice the limited permissions:
   - Can view stories and add notes
   - Cannot delete, export, or invite others

## 👥 Manager Roles & Permissions

The platform supports two types of managers with different access levels:

### Admin Managers
- ✅ Full access to all features
- ✅ View, update, delete stories
- ✅ Export stories to CSV/JSON
- ✅ **Invite new managers** (both Admin and Manager roles)
- ✅ View team members and pending invitations
- ✅ Revoke pending invitations

### Regular Managers
- ✅ View all submitted stories
- ✅ Add notes to stories
- ❌ Cannot change story status
- ❌ Cannot delete stories
- ❌ Cannot export data
- ❌ Cannot invite other managers

### How Invitations Work

1. **Admin creates invitation:**
   - Enters invitee's email
   - Selects role (Admin or Manager)
   - System sends email with secure token

2. **Invitee receives email:**
   - Email includes role information
   - Link is valid for 48 hours
   - Token is single-use only

3. **Invitee accepts:**
   - Clicks link in email
   - Sets their password
   - Automatically logged in
   - Access granted based on assigned role

4. **Security features:**
   - Tokens are cryptographically secure (64 characters)
   - Rate limited (3 attempts per 15 minutes)
   - Server-side role validation on all endpoints
   - Expired/used tokens are rejected

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
- Role-based access control (Admin vs Manager permissions)
- Secure invitation system with token expiration (48 hours)
- Single-use invitation tokens
- Rate limiting on invitation endpoints (10/hour for creation, 3/15min for acceptance)
- Server-side permission validation
- Audit logging for privileged actions

Enjoy building your story platform! 🚀

