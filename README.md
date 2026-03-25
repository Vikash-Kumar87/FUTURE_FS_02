# Client Lead Management System (Mini CRM)

A production-style full stack CRM for managing business leads with a modern dashboard UI, smooth animations, secure authentication, and Firebase-powered data storage.

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Hot Toast

### Backend
- Node.js
- Express.js REST API
- Firebase Admin SDK
- Multer for file upload handling

### Firebase
- Firebase Authentication (Email/Password + Google)
- Firestore for lead storage
- Firebase Storage for attachments (PDF/images)

## Project Structure

```text
backend/
  src/
    app.js
    index.js
    config/firebaseAdmin.js
    controllers/leadController.js
    middleware/
    routes/leadRoutes.js
frontend/
  src/
    components/
    context/
    firebase/
    pages/
    services/
    utils/
```

## Features

- Secure authentication with protected dashboard routes
- Dashboard with lead stats (total, contacted, converted)
- Create, read, update, delete leads
- Lead status progression (New, Contacted, Converted)
- Search and status filters
- Notes management per lead
- Optional lead attachment upload (PDF/image)
- Responsive modern UI with glassmorphism and gradient styling
- Dark/light mode toggle
- Smooth page and component animations

## Setup Instructions

## 1) Prerequisites

- Node.js 18+
- Firebase project with:
  - Authentication enabled (Email/Password and Google provider)
  - Firestore database created
  - Storage bucket enabled
- Firebase service account key for backend

## 2) Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Fill `backend/.env` with your Firebase Admin and app values:

- `PORT`
- `CLIENT_ORIGINS`
- `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON string or base64)
  - OR `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`

Backend runs at `http://localhost:5000`.

## 3) Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Fill `frontend/.env` with Firebase web app config:

- `VITE_API_BASE_URL=http://localhost:5000/api`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Frontend runs at `http://localhost:5173`.

## 4) Firestore Data Model

Collection: `leads`

Each document:

```json
{
  "name": "Jane Cooper",
  "email": "jane@example.com",
  "source": "LinkedIn",
  "status": "New",
  "notes": "Requested pricing details",
  "userId": "firebase-user-id",
  "attachment": {
    "fileName": "proposal.pdf",
    "contentType": "application/pdf",
    "size": 24567,
    "url": "https://...",
    "storagePath": "leads/uid/doc/file.pdf",
    "uploadedAt": "2026-03-17T00:00:00.000Z"
  },
  "createdAt": "Firestore Timestamp",
  "updatedAt": "Firestore Timestamp"
}
```

## 5) Suggested Firebase Security Rules (Client-side reads disabled)

This architecture uses backend API for lead operations. Keep Firestore locked down from direct client access if desired:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## API Endpoints

Base: `/api`

- `GET /health`
- `GET /leads`
- `POST /leads`
- `PATCH /leads/:id`
- `DELETE /leads/:id`
- `POST /leads/:id/attachment`

All lead endpoints require `Authorization: Bearer <Firebase ID Token>`.

## Production Notes

- Configure HTTPS and trusted origins in `CLIENT_ORIGINS`
- Add API rate limiting and request validation for public deployment
- Store env variables in secure secret managers
- Use CI/CD and run lint/build checks before deployment

## Auto Deploy (GitHub Actions Fallback)

If platform Git integration does not trigger reliably, this repo includes a workflow at `.github/workflows/auto-deploy.yml` that runs on every push to `main` and can trigger deploy hooks.

Set one or both GitHub repository secrets:

- `RENDER_DEPLOY_HOOK_URL` = Render deploy hook URL (Render dashboard -> service -> Settings -> Deploy Hook)
- `VERCEL_DEPLOY_HOOK_URL` = Vercel deploy hook URL (Vercel dashboard -> Project -> Settings -> Git -> Deploy Hooks)

After adding secrets, any push to `main` triggers deployment automatically.
