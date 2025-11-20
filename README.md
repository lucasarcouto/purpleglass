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

3. Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Adminer (Database UI): http://localhost:8080

4. Stop the application:

```bash
docker compose down
```

To stop and remove volumes (including database data):

```bash
docker compose down -v
```

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
- `GET /api/data` - Sample data endpoint

## Features

- React frontend with Vite
- Node.js/Express backend
- PostgreSQL database
- Adminer database management UI
- Docker containerization with Docker Compose
- Environment-based configuration
- CORS enabled
- Hot reload in development mode

## Database Access

**Using Adminer:**

1. Navigate to http://localhost:8080
2. Login with the from .env credentials
