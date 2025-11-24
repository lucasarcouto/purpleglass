# PurpleGlass

Privacy focused note taking app.

## Project Structure

```
purpleglass/
├── backend/
│   ├── .env              # Backend config (create from .env.example)
│   └── .env.example
├── frontend/
│   ├── .env              # Frontend config (create from .env.example)
│   └── .env.example
└── docker-compose.yml    # Infrastructure config (Postgres, Adminer)
```

## Prerequisites

- Docker and Docker Compose installed on your machine
- Node.js (if running without Docker)

## Running with Docker

1. Set up environment variables for backend and frontend:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit the `.env` files if needed.

2. Start the application:

```bash
docker compose up --build
```

3. Run database migrations (first time or after volume reset):

```bash
docker compose exec backend npx prisma migrate deploy
```

4. Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Adminer (Database UI): http://localhost:8080

5. Stop the application:

```bash
docker compose down
```

> **Warning:** Avoid `docker compose down -v` as the `-v` flag removes volumes and **deletes all database data**.

## Running without Docker

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check endpoint

## Features

- React frontend with Vite
- Node.js/Express backend
- PostgreSQL database with Prisma ORM
- Adminer database management UI
- Docker containerization with Docker Compose
- Environment-based configuration
- CORS enabled
- Hot reload in development mode

## Database

This project uses **Prisma** as the ORM. The schema is located at `backend/src/core/database/prisma/schema.prisma`.

### After Changing the Schema

Create and run a migration to apply your changes:

```bash
docker compose exec backend npx prisma migrate dev --name <describe_your_change>
```

This creates a migration file, applies it to the database, and regenerates the Prisma client.

### Common Commands

```bash
# Apply existing migrations (e.g., after pulling changes or first setup)
docker compose exec backend npx prisma migrate deploy

# Reset database (destructive - deletes all data)
docker compose exec backend npx prisma migrate reset

# Open Prisma Studio (database GUI)
docker compose exec backend npx prisma studio
```

### Adminer

1. Navigate to http://localhost:8080
2. Login with credentials from `.env`
