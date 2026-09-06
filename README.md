# Job Hunt Dashboard

A job-application tracker built as a portfolio project to demonstrate a **production-style frontend architecture** — plus a real in-repo backend, not just React components.

## Features

- **JWT auth** (bcrypt + httpOnly cookies) with protected routes, login/register/logout
- **Dashboard** with live stats (total, interviews, offers, rejected, this month, upcoming)
- **Applications**: full CRUD with search, status filter, sortable columns, pagination, table + drag-and-drop **Kanban** board, expandable rows with notes + interview-prep notes
- **Companies**: applications aggregated by employer, ranked by best outcome
- **Calendar** of interview dates (month grid)
- **Analytics**: status donut, applications-per-month area, status-trend stacked bars (Recharts)
- **Dark/light theme** toggle, Framer Motion transitions, custom MUI theme

## Stack

- **Next.js 14 (App Router)** + **TypeScript** (strict)
- **Material UI** (custom theme) + **Framer Motion** + **Recharts** + **dnd-kit**
- **Redux Toolkit** — business/global state (auth only; no doubled-up state)
- **RTK Query** — server state (caching, loading, error, invalidation) via `fetchBaseQuery({ baseUrl: '/api' })`
- **Zustand** — ephemeral UI state (sidebar, table/kanban mode)
- **Backend (in-repo)**: Next.js Route Handlers — `jose` JWT in httpOnly cookies, `bcryptjs` password hashing, file store (`data.json`, swappable for a real DB without touching components)

## The architecture story (interview-ready)

```
                APPLICATION
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
   RTK Query           Redux            Zustand
 SERVER STATE      BUSINESS STATE       UI STATE
   API/cache         auth only      sidebar, view mode
```

RTK Query owns all API data + caching. Redux owns genuine global business state. Zustand owns throwaway UI state. Nothing is doubled up. API responses are normalized at the boundary (`transformResponse`), so components always see clean arrays.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — register an account and explore. Data persists in `data.json` (3 seeded demo applications on first run).

Optional: set `JWT_SECRET` in `.env.local` (falls back to a dev-only default).

```bash
npm run build   # production build (typecheck-clean, all routes)
```

## API

| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | — | `{name, email, password}` → sets session cookie |
| POST | `/api/auth/login` | — | `{email, password}` → sets session cookie |
| GET | `/api/auth/me` | cookie | current user or 401 |
| POST | `/api/auth/logout` | — | clears session cookie |
| GET | `/api/apps` | cookie | `{ applications, companies }` |
| POST | `/api/apps` | cookie | create → `{ ok, app }` |
| PUT | `/api/apps` | cookie | `{ id, ...patch }` → `{ ok, app }` |
| DELETE | `/api/apps?id=` | cookie | query param (DELETE bodies are unreliable) |
| GET | `/api/apps/[id]` | cookie | single application |
| GET | `/api/companies` | cookie | `{ companies }` aggregated summaries, ranked |
| GET | `/api/stats` | cookie | totals, status counts, trends, avg salary |

## Roadmap

- [x] Phase 1: scaffold, theme, sidebar shell, dashboard
- [x] Phase 2: Applications CRUD (search/filter/sort/pagination)
- [x] Phase 3: Kanban board (drag & drop)
- [x] Phase 4: Auth (JWT) + protected routes
- [x] Phase 5: Calendar, Analytics (Recharts), dark/light mode
- [x] Phase 6: Companies aggregation, interview-prep notes
- [x] Phase 7: real backend — Route Handlers + JWT cookies + file store (zero component changes, as designed)
- [ ] Future: swap file store for MongoDB/Postgres, per-user data isolation
