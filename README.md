# PurpleGlass

A privacy-focused note-taking application with **client-side AI** capabilities. All AI processing (LLM and speech recognition) runs locally in your browser — no data is sent to external AI services.

## What is PurpleGlass?

PurpleGlass is a modern note-taking app that combines rich text editing with powerful AI features while maintaining complete privacy. Unlike traditional AI-powered apps that send your data to cloud services, PurpleGlass runs Large Language Models (LLMs) and Whisper speech recognition entirely in your browser using WebAssembly and WebGPU.

### Why Privacy-First?

- **Client-Side AI Processing**: All LLM operations (summarization, title generation, chat) run locally using WebLLM
- **Local Speech Recognition**: Audio transcription uses Transformers.js with Whisper models
- **Your Data Stays Yours**: Notes and AI interactions never leave the device for processing
- **Offline Capable**: Once models are downloaded, AI features work without internet connection

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

### For AI Features

- **Modern Browser**: Chrome/Edge 113+, or other browsers with WebGPU support
- **Storage**: 600MB - 2.2GB free space (depending on model choice)
- **Memory**: 4GB+ RAM recommended for LLM features
- **GPU**: WebGPU-capable GPU recommended for better performance

**Available Models:**

- **LLM**: Llama 3.2 (1B/3B), Phi 3.5 Mini, Qwen 2.5 (~600MB - 2GB)
- **Whisper**: Tiny (~39MB), Base (~74MB), Small (~244MB)

## Running with Docker

1. Set up environment variables for backend and frontend:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. **IMPORTANT: Configure required environment variables** in `backend/.env`:

   **Generate a JWT secret:**

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   Copy the output and replace `JWT_SECRET="your_secure_random_string_here"` in `backend/.env`

   **Set up Vercel Blob Storage** (required for file uploads):

   - Create a Vercel account at https://vercel.com
   - Create a Blob store: https://vercel.com/docs/storage/vercel-blob/quickstart
   - Copy your token and replace `BLOB_READ_WRITE_TOKEN="your_vercel_blob_token_here"` in `backend/.env`

3. Start the application:

```bash
docker compose up --build
```

4. Run database migrations (first time or after volume reset):

```bash
docker compose exec backend npx prisma migrate deploy
```

5. Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Adminer (Database UI): http://localhost:8080

6. Stop the application:

```bash
docker compose down
```

> **Warning:** Avoid `docker compose down -v` as the `-v` flag removes volumes and **deletes all database data**.

## Running without Docker

### Prerequisites

1. **PostgreSQL**: Install and run PostgreSQL locally
2. **FFmpeg**: Required for audio transcoding

   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu/Debian
   sudo apt-get install ffmpeg

   # Windows (using Chocolatey)
   choco install ffmpeg
   ```

### Setup

1. Set up environment variables:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. **Configure `backend/.env`:**

   - Update `DATABASE_URL` to use `localhost` instead of `postgres`:
     ```
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/purpleglass?schema=public"
     ```
   - Generate and set `JWT_SECRET` (see Docker instructions above)
   - Set up `BLOB_READ_WRITE_TOKEN` for Vercel Blob Storage (see Docker instructions above)

3. Create the database and run migrations:

```bash
cd backend
npm install
npx prisma migrate deploy
```

### Running the Application

**Backend** (in one terminal):

```bash
cd backend
npm run dev
```

**Frontend** (in another terminal):

```bash
cd frontend
npm install
npm run dev
```

Access the application at http://localhost:3000

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user and receive JWT token
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/logout` - Logout user

### Users (GDPR Compliance)

- `GET /api/users/me` - Get current user profile
- `GET /api/users/export` - Export all user data as JSON (GDPR Article 20 - Right to Data Portability)
- `DELETE /api/users/account` - Delete account and all data (GDPR Article 17 - Right to Erasure)

### Notes

- `GET /api/notes` - List all user's notes
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create new note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### File Upload

- `POST /api/upload` - Upload file to Vercel Blob (max 10MB)
- `DELETE /api/upload` - Delete file(s) with ownership verification

### Health

- `GET /api/health` - Server health check

## Features

### Note-Taking

- **Rich Text Editor**: Powered by BlockNote with support for:
  - Formatted text (bold, italic, underline, code, etc.)
  - Headers, lists, quotes, and code blocks
  - Image, video, and audio embedding
  - File uploads with drag-and-drop
- **Auto-Save**: Automatic note saving with status indicators (saving/saved/error)
- **Tag Management**: Manual and AI-generated tags for organization
- **Search & Filter**: Find notes quickly with search and tag filtering
- **Media Support**: Upload images, embed videos, and record audio directly in notes

### AI-Powered Features (100% Client-Side)

#### Large Language Models (LLM)

Choose from multiple models (Llama 3.2, Phi 3.5, Qwen 2.5) for:

- **Smart Summarization**: Generate concise 2-3 sentence summaries
- **Title Generation**: Auto-suggest titles from note content
- **Tag Suggestions**: AI-powered tag generation
- **Bullet Point Extraction**: Convert prose to organized bullet points
- **Tone Rewriting**: Rewrite content in professional, casual, formal, friendly, or creative tones
- **Chat Assistant**: Context-aware AI chat about your notes

#### Speech Recognition

Whisper models (Tiny/Base/Small) for:

- **Audio Recording**: Built-in browser-based audio capture
- **Speech-to-Text**: Transcribe recordings directly in the app
- **Auto-Format Conversion**: Server-side FFmpeg transcoding for browser compatibility

### Security & Privacy

- **User Authentication**: Secure registration and login with JWT tokens
- **Password Security**: Bcrypt hashing with salt rounds
- **Access Control**: Users can only access their own notes and files
- **Client-Side AI**: No data sent to external AI services
- **Offline AI**: Models cached locally in IndexedDB for offline use

### Technical Stack

- **Frontend**: React + Vite with TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Prisma ORM
- **AI**: MLC AI (WebLLM) + Transformers.js (Whisper)
- **Storage**: Vercel Blob for media files
- **Dev Tools**: Docker Compose, Adminer, Hot reload

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

## Security & Compliance

PurpleGlass implements comprehensive security measures and complies with major privacy regulations (GDPR, CCPA).

### Implemented Security Features

#### Authentication & Authorization

- ✅ **JWT Token Authentication**: Secure token-based auth with 7-day expiration
- ✅ **Password Hashing**: Bcrypt with 10 salt rounds
- ✅ **Rate Limiting**:
  - Login: 5 attempts per 15 minutes per IP
  - Registration: 3 accounts per hour per IP
  - File uploads: 20 uploads per hour per IP
- ✅ **Access Control**: Users can only access their own data (notes, files)

#### Data Protection

- ✅ **Security Headers**: Helmet middleware with CSP, X-Frame-Options, HSTS, etc.
- ✅ **Input Validation**: Email format, password strength (min 8 chars), file type validation
- ✅ **File Upload Security**:
  - 10MB size limit
  - MIME type whitelist (images, audio, video, PDF only)
  - Malicious file rejection
- ✅ **JSON Payload Limits**: 1MB max to prevent DoS attacks
- ✅ **CORS Configuration**: Restricted to allowed origins only

#### Privacy Features

- ✅ **Client-Side AI**: All AI processing (LLM, Whisper) runs in your browser - no data sent to external AI services
- ✅ **Data Isolation**: Strong database-level user data separation
- ✅ **Audit Logging**: Security-relevant operations logged (see schema)
- ✅ **Privacy Policy**: Comprehensive privacy policy (see [privacy-policy.md](./privacy-policy.md))
- ✅ **Terms of Service**: Clear terms (see [terms-of-service.md](./terms-of-service.md))

### GDPR Compliance

#### User Rights Implemented

✅ **Article 7 - Consent**:

- Explicit consent checkboxes during registration
- Links to Privacy Policy and Terms of Service
- Cannot register without consent

✅ **Article 13 - Information to be Provided**:

- Complete Privacy Policy explaining data collection and processing
- Terms of Service defining usage rights and obligations

✅ **Article 15 - Right of Access**:

- Users can access all their data through the application

✅ **Article 17 - Right to Erasure ("Right to be Forgotten")**:

- Account deletion endpoint: `DELETE /api/users/account`
- Deletes all user data (notes, files, metadata)
- Requires password confirmation
- Frontend UI in Settings (to be implemented)

✅ **Article 20 - Right to Data Portability**:

- Data export endpoint: `GET /api/users/export`
- Downloads complete JSON export of all user data
- Includes notes, files, tags, and metadata
- Frontend UI in Settings (to be implemented)

### CCPA Compliance

✅ **Right to Know**: Privacy Policy explains data collection
✅ **Right to Delete**: Account deletion feature
✅ **Right to Opt-Out**: We don't sell personal information
✅ **Right to Non-Discrimination**: Equal service for all users

### Security Best Practices

#### Implemented

- ✅ Bcrypt password hashing
- ✅ JWT token expiration
- ✅ Rate limiting on sensitive endpoints
- ✅ File type validation
- ✅ CORS restrictions
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Input validation and sanitization
- ✅ Database cascade deletion
- ✅ Audit logging table (schema defined)

#### Recommended for Production

⚠️ **Database Encryption at Rest**:

- Enable PostgreSQL encryption (pgcrypto or TDE)
- See deployment provider documentation

⚠️ **Private Blob Storage**:

- Currently using public Vercel Blob URLs
- TODO: Implement signed URLs with expiration
- Or proxy file access through backend with auth

⚠️ **Environment Security**:

- Use strong JWT_SECRET (not default value)
- Rotate secrets regularly
- Use environment-specific secrets (dev/staging/prod)

⚠️ **Monitoring & Alerts**:

- Set up error monitoring (Sentry, etc.)
- Configure security alerts for suspicious activity
- Monitor rate limit violations

### Running Prisma Migrations

After pulling these security changes, run the database migration to create the audit_logs table:

```bash
# With Docker
docker compose exec backend npx prisma migrate dev --name add_security_features

# Without Docker
cd backend
npx prisma migrate dev --name add_security_features
```

## Roadmap

Planned features and improvements:

1. **Enhanced Privacy**

   - Make Vercel Blob URLs private
   - End-to-end encryption for notes in backend and transit

2. **Offline-First Architecture**

   - Allow users to disable cloud sync
   - Full offline mode with local storage
   - Optional sync for backup purposes

3. **Import/Export**

   - Export notes to Markdown (.md) and PDF formats
   - Import notes from Markdown files

4. **Real-Time Sync**

   - Live sync across devices
   - Conflict resolution for offline edits

5. **Technical Improvements**
   - MobX for complex state management (NotesPage, AI, Whisper)
   - UI/UX refinements and polish
