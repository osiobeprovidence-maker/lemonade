# Lemonade

Lemonade is a Vite + React reading platform prototype with Firebase auth/storage and Convex-backed app data for readers, creators, story styling, comments, notifications, and wallet features.

## Local setup

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values you need.
3. Start the app:
   `npm run dev`

The frontend runs on `http://localhost:3000`.

## Useful scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` creates a production build in `dist/`.
- `npm run lint` runs TypeScript type-checking.
- `npm run convex:dev` starts local Convex development.
- `npm run convex:deploy` deploys Convex functions.
- `npm run convex:dashboard` opens the Convex dashboard.

## Netlify

This project is ready to host on Netlify.

- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing is handled in [netlify.toml](/C:/Users/USER/OneDrive/Desktop/lemonade/netlify.toml)

Set these environment variables in Netlify before deploying:

- `VITE_CONVEX_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` if used

## Environment

The app expects a mix of Vite, Firebase, and Convex environment variables. Start from [.env.example](./.env.example) and add any project-specific values used by your Firebase and Convex setup.
