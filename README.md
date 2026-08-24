# Job Hunt Dashboard

A job-application tracker built as a frontend portfolio project to demonstrate a **production-style state architecture**, not just React components.

## Stack
- **Next.js (App Router)** + **TypeScript**
- **Material UI** (custom theme)
- **Redux Toolkit** — business/global state (auth, selected application)
- **RTK Query** — server state (API + caching). v1 uses an in-memory MOCK backend.
- **Zustand** — ephemeral UI state (sidebar, kanban mode)

## The architecture story (interview-ready)
```
                APPLICATION
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
   RTK Query           Redux            Zustand
 SERVER STATE      BUSINESS STATE       UI STATE
   API/cache       auth, selection    sidebar, view
```
RTK Query owns all API data + caching. Redux owns genuine global business state.
Zustand owns throwaway UI state. Nothing is doubled up.

## Run it
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Roadmap
- Phase 1 (done): scaffold, theme, sidebar shell, dashboard via RTK Query mock.
- Phase 2: Applications CRUD (RTK Query mutations, search/filter/sort/pagination).
- Phase 3: Kanban board (drag & drop, optimistic updates).
- Phase 4: Auth (JWT) + protected routes.
- Phase 5: Calendar, Analytics (Recharts), dark/light mode.
- Phase 6: swap mock backend for Next.js Route Handlers + MongoDB (reuse Mongoose skills).

## Why a mock backend first?
Fastest path to focus on frontend + interview prep. RTK Query points at a
`fakeBaseQuery` now; swapping to `fetchBaseQuery({ baseUrl: '/api' })` + Route
Handlers later requires **zero component changes** — that separation is the point.
