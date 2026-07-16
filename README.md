# CoachOS Frontend

CoachOS Frontend is a role-aware web application with separate coach and athlete shells. Coaches manage profiles, goals, drills, timelines, and AI review approval. Athletes use dedicated APIs to view approved feedback, assignments, goals, safe timeline history, and a limited profile.

## Technology

- React 19, Vite, and strict TypeScript
- React Router for public and protected routes
- TanStack Query and Axios for server state and HTTP requests
- React Hook Form and Zod for validated forms
- Tailwind CSS and Lucide icons for the interface
- Vitest, React Testing Library, and MSW for tests

## Architecture

The frontend is organized by responsibility:

```text
src/
├── api/                 # Axios clients, endpoint functions, query keys
├── app/                 # Root providers and centralized router
├── components/          # Shared controls, feedback, forms, navigation
├── features/
│   ├── auth/            # Session context, login, schemas, types
│   ├── dashboard/       # Coach dashboard composition
│   ├── athletes/        # List, profile, create/edit, hooks and types
│   ├── goals/           # Goal forms, mutations, filters
│   ├── timeline/        # Timeline filters and event rendering
│   ├── ai-review/       # Review queue, request form, generated draft and approval actions
│   └── drills/          # Library, assignment modes, athlete drill lifecycle
├── layouts/             # Auth, coach, and athlete app shells
├── lib/                 # Environment, session storage, formatters
├── routes/              # Protected and public-only guards
├── styles/              # Tailwind entry and global focus styles
├── test/                # MSW server, fixtures, render helpers
└── types/               # Shared API envelopes and errors
```

API functions do not depend on React. Feature hooks own query and mutation behavior. React Context is limited to authentication; TanStack Query owns backend state. The bearer token is held in `sessionStorage` and an in-memory cache, attached by Axios interceptors, and never logged.

## Environment

Copy `.env.example` to `.env` for local development. The application validates every variable during startup.

| Variable                 | Purpose                                           | Local example           |
| ------------------------ | ------------------------------------------------- | ----------------------- |
| `VITE_APP_NAME`          | Product name                                      | `CoachOS`               |
| `VITE_APP_ENV`           | `development`, `test`, `staging`, or `production` | `development`           |
| `VITE_AUTH_API_URL`      | Auth Service origin                               | `http://localhost:8000` |
| `VITE_ATHLETE_API_URL`   | Athlete Service origin                            | `http://localhost:8001` |
| `VITE_AI_REVIEW_API_URL` | AI Review Service origin                          | `http://localhost:8004` |
| `VITE_MEDIA_API_URL`     | Media Service origin                              | `http://localhost:8003` |

Vite embeds these values at build time. Do not put secrets in `VITE_*` variables.

## Local Development

Start the Auth Service and Athlete Service first, including PostgreSQL and Alembic migrations. Their CORS settings must allow the frontend origin.

```bash
npm install
npm run dev
```

The default frontend URL is `http://localhost:5173`.

## Routes

| Route                                       | Access      | Purpose                                   |
| ------------------------------------------- | ----------- | ----------------------------------------- |
| `/login`                                    | Public only | Coach or athlete login                    |
| `/invitations/accept`                       | Public only | Athlete password setup                    |
| `/`                                         | Protected   | Redirects to the dashboard                |
| `/dashboard`                                | Protected   | Active athlete summary and recent records |
| `/athletes`                                 | Protected   | Searchable and filterable athlete list    |
| `/athletes/new`                             | Protected   | Create an athlete                         |
| `/athletes/:athleteId`                      | Protected   | Overview, goals, and timeline             |
| `/athletes/:athleteId/edit`                 | Protected   | Edit an athlete                           |
| `/reviews`                                  | Protected   | AI review queue                           |
| `/reviews/:reviewId`                        | Protected   | Generated review and coach actions        |
| `/athletes/:athleteId/reviews`              | Protected   | Athlete-filtered review queue             |
| `/videos/:videoId/reviews/new`              | Protected   | Request a review for an uploaded video    |
| `/drills`                                   | Protected   | Search and manage the drill library       |
| `/drills/new`                               | Protected   | Create a reusable drill                   |
| `/drills/:drillId`                          | Protected   | Drill details                             |
| `/drills/:drillId/edit`                     | Protected   | Edit an owned drill                       |
| `/athletes/:athleteId/drills`               | Protected   | Athlete drill assignments                 |
| `/athletes/:athleteId/drills/:assignmentId` | Protected   | Assignment details and lifecycle          |
| `/athlete/dashboard`                        | Athlete     | Personal progress dashboard               |
| `/athlete/feedback`                         | Athlete     | Approved athlete-visible feedback         |
| `/athlete/feedback/:reviewId`               | Athlete     | Immutable approved feedback detail        |
| `/athlete/drills`                           | Athlete     | Current and completed assignments         |
| `/athlete/drills/:assignmentId`             | Athlete     | Start, progress, and completion actions   |
| `/athlete/timeline`                         | Athlete     | Athlete-visible timeline                  |
| `/athlete/goals`                            | Athlete     | Read-only goals                           |
| `/athlete/profile`                          | Athlete     | Limited personal profile                  |
| `*`                                         | Any         | Not-found page                            |

## Backend Integration

The Auth Service provides `POST /auth/login` and `GET /auth/me`. The Athlete Service provides athletes, goals, timeline, drill library, and assignment lifecycle endpoints. The AI Review Service provides asynchronous review requests, immutable approved recommendations, and coach approval actions. Query requests pass `AbortSignal` to Axios so unmounted reads can be cancelled.

Axios normalizes FastAPI detail strings, validation lists, the CoachOS error envelope, network failures, and common HTTP statuses. A protected `401` clears the token, authenticated user, and query cache; route guards then send the coach to `/login`. Backend `422` field errors are applied to matching form controls.

## Authentication

Login saves only the access token for the current browser tab and always verifies it with `/auth/me`. `RequireCoachRoute` and `RequireAthleteRoute` enforce distinct navigation shells and redirect wrong-role users to a safe unauthorized page. Coaches default to `/dashboard`; athletes default to `/athlete/dashboard`. Logout clears credentials and cached server data.

## Quality Commands

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run format
```

Tests use MSW and cover authentication, role restoration and route separation, coach workflows, athlete dashboard and feedback rendering, athlete-safe drill detail, progress submission, drill library behavior, timeline, empty/error/loading behavior, and fallback routing.

## Production Build

```bash
npm run build
npm run preview
```

The container builds static assets and serves them with Nginx. Its configuration falls back to `index.html` for client-side routes and applies immutable caching only to static assets.

```bash
docker build -t coachos-frontend .
docker run --rm -p 8080:80 coachos-frontend
```

## Known Limitations

- Access tokens have no refresh-token workflow yet. Expiration returns the coach to login.
- Video upload selection is still a Media Service workflow; the new-review route expects an uploaded video ID and its practice session ID.
- Athlete video playback is intentionally omitted until Media Service owns an explicit athlete-visible authorization signal.
- Bundle code splitting is not yet configured; the current production build reports a non-blocking chunk-size warning.

## Future Stages

Later stages can add refresh-token rotation, recurring plans, richer progress insights, secure athlete video playback, and deployment observability without changing the current feature boundaries.
