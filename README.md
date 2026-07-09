# CoachOS Frontend

React web application for CoachOS coaches and future athlete users.

## Responsibilities

- Coach login and signup screens
- Protected dashboard shell
- Athlete list and profile pages
- Video upload workflow
- AI review view and approval workflow
- Drill assignment workflow
- Future athlete dashboard

## Tech Stack

- React
- TypeScript
- Vite
- Docker
- Nginx for production container serving

## Project Structure

- `public`: static assets
- `src/assets`: images and static app assets
- `src/components`: shared UI components
- `src/features`: feature-specific modules
- `src/hooks`: shared React hooks
- `src/layouts`: page layouts and app shell
- `src/lib`: framework and library setup
- `src/pages`: route-level pages
- `src/routes`: routing configuration
- `src/services`: API clients
- `src/store`: client state
- `src/styles`: global styles
- `src/types`: shared TypeScript types
- `src/utils`: utility helpers

## Environment

`.env.example` is committed as a template. `.env` is ignored by git and should contain local values.

Current values:

- `VITE_APP_NAME`
- `VITE_API_BASE_URL`

## Running Locally

```bash
npm install
npm run dev
```

Default local URL:

- `http://localhost:5173`

## Build

```bash
npm run build
```

## Docker

```bash
docker build -t coachos-frontend .
docker run --rm -p 8080:80 coachos-frontend
```

## Planned Pages

- Login
- Signup
- Coach dashboard
- Athlete list
- Athlete profile
- Video upload
- AI review detail
- Drill assignment
- Athlete dashboard

## Status

Stage 0: Vite React skeleton created. Routing, API client, auth state, and dashboard UI are next.
