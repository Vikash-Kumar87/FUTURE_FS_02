# LeadForge CRM Frontend

This repository is currently frontend-only.

The backend has been intentionally removed and will be rebuilt later with a new architecture and Firebase admin setup.

## Tech Stack

- React + Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Hot Toast
- Firebase Web SDK (Auth + Firestore + Storage on client)

## Project Structure

```text
frontend/
  src/
    components/
    context/
    firebase/
    pages/
    services/
    utils/
```

## Local Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Fill `frontend/.env` with:

- `VITE_API_BASE_URL` (temporary placeholder until new backend is created)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional)

3. Run frontend:

```bash
npm run dev
```

## Deployment

- Vercel is the active deployment target.
- GitHub Actions fallback deploy hook workflow is configured at `.github/workflows/auto-deploy.yml`.
- Required repository secret:
  - `VERCEL_DEPLOY_HOOK_URL`

## Notes

- Since backend is removed, API-dependent features may remain unavailable until the new backend is implemented.
