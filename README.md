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
# Edit .env with your Neon DATABASE_URL and Gmail credentials

# Generate Prisma client
deno task generate

# Run migrations
deno task migrate

# Create first manager account
deno run --allow-all scripts/create-manager.ts

# Start development server
deno task dev
```

The API will be available at `http://localhost:8000`

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

## API Endpoints

### Public
- `POST /api/stories` - Submit anonymous story

### Authentication
- `POST /api/auth/login` - Manager login
- `POST /api/auth/logout` - Manager logout
- `GET /api/auth/me` - Get current manager

### Manager (Protected)
- `GET /api/manager/stories` - List stories (paginated)
- `GET /api/manager/stories/:id` - Get single story
- `PATCH /api/manager/stories/:id` - Update story
- `DELETE /api/manager/stories/:id` - Delete story
- `GET /api/manager/stories/export` - Export stories
- `GET /api/manager/stats` - Dashboard statistics

## Environment Variables

See `.env.example` files in backend and frontend directories for required variables.

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

