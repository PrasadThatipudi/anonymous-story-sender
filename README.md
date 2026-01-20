# Anonymous Story Submission Platform

A secure, responsive web platform for anonymously submitting stories with a manager dashboard for reviewing and managing submissions.

## Tech Stack

**Backend:**
- Hono (Ultrafast web framework)
- Deno (Secure TypeScript runtime)
- Prisma ORM (Type-safe database client)
- Neon PostgreSQL (Serverless database)
- JWT Authentication with bcrypt

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS
- TanStack Query
- Axios

## Project Structure

```
anonymous-story-sender/
├── backend/          # Hono + Deno API
│   ├── src/
│   │   ├── domain/           # Entities, enums, types
│   │   ├── application/      # Services, DTOs
│   │   ├── infrastructure/   # Database, email
│   │   ├── presentation/     # Routes, middleware
│   │   ├── config/          # Environment config
│   │   └── main.ts          # Entry point
│   └── deno.json
└── frontend/         # React apps
    └── packages/
        ├── viewer/   # Public story submission
        └── manager/  # Manager dashboard
```

## Quick Start

### 1. Setup Neon Database

1. Sign up at [https://neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 2. Backend Setup

```bash
cd backend

# Create .env file
cp .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL (Neon connection string)
# - Gmail credentials (GMAIL_USER, GMAIL_APP_PASSWORD)
# - Bootstrap admin credentials (BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD)
# - FRONTEND_MANAGER_URL (http://localhost:5174 for dev)

# Generate Prisma client
deno task generate

# Run migrations and seed bootstrap admin
deno task migrate

# Start development server
deno task dev
```

The API will be available at `http://localhost:8000`

The seed script will automatically create a bootstrap admin account using the credentials from your `.env` file.

### 3. Frontend Setup

**Viewer App (Port 5173):**
```bash
cd frontend/packages/viewer

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# Install dependencies
npm install

# Start development server
npm run dev
```

**Manager App (Port 5174):**
```bash
cd frontend/packages/manager

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Apps

- **Viewer**: http://localhost:5173
- **Manager**: http://localhost:5174
- **API**: http://localhost:8000

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

## Gmail SMTP Setup

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the 16-character app password in your `.env` file

## Manager Roles & Permissions

The platform supports two levels of managers:

### Admin Managers
- Full access to all features
- Can view, update, delete, and export stories
- Can invite new managers (both Admin and regular Manager roles)
- Can manage team members and invitations

### Regular Managers
- View-only access to stories
- Can add notes to stories
- Cannot modify story status, delete stories, or export data
- Cannot invite other managers

## Manager Invitation Flow

1. Admin logs into the manager dashboard
2. Admin clicks "Invite Manager" and provides:
   - Email address of the invitee
   - Role (Admin or Manager)
3. System sends an email invitation with a secure token (valid for 48 hours)
4. Invitee clicks the link in the email
5. Invitee sets their password and account is created
6. Invitee is automatically logged in

## API Endpoints

### Public
- `POST /api/stories` - Submit anonymous story

### Authentication
- `POST /api/auth/login` - Manager login
- `POST /api/auth/accept-invitation` - Accept invitation and create account
- `POST /api/auth/logout` - Manager logout
- `GET /api/auth/me` - Get current manager

### Manager (Protected - All Roles)
- `GET /api/manager/stories` - List stories (paginated)
- `GET /api/manager/stories/:id` - Get single story
- `GET /api/manager/stats` - Dashboard statistics

### Manager (Admin Only)
- `PATCH /api/manager/stories/:id` - Update story
- `DELETE /api/manager/stories/:id` - Delete story
- `GET /api/manager/stories/export` - Export stories
- `POST /api/manager/invitations` - Create invitation
- `GET /api/manager/invitations` - List pending invitations
- `DELETE /api/manager/invitations/:id` - Revoke invitation
- `GET /api/manager/managers` - List all managers

## Environment Variables

### Backend `.env` (Required)
```
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRY=24h
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
MANAGER_EMAILS=admin@example.com
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
PORT=8000
DENO_ENV=development
BOOTSTRAP_ADMIN_EMAIL=admin@yourcompany.com
BOOTSTRAP_ADMIN_PASSWORD=SecurePassword123!
FRONTEND_MANAGER_URL=http://localhost:5174
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Security Features

- bcrypt password hashing (10 rounds)
- JWT authentication with HttpOnly cookies
- Rate limiting on sensitive endpoints
- CORS with explicit origin whitelist
- Security headers (CSP, HSTS, etc.)
- Input validation with Zod
- PII-safe logging (no story content in logs)
- SQL injection prevention via Prisma

## License

MIT

