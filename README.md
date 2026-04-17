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

## Environment

The app expects a mix of Vite, Firebase, and Convex environment variables. Start from [.env.example](./.env.example) and add any project-specific values used by your Firebase and Convex setup.
