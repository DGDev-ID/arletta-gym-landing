# Arletta Gym — Landing (Vue 3 + Vite + Tailwind)

A modern, premium dark-themed gym landing template built with Vue 3, Vite and Tailwind CSS. This repo contains a fully componentized landing site (Home, Membership, Class Programs, Personal Trainers, About), auth UI, and demo fixtures to speed up development.

## Quick links

- Source: `src/` (components under `src/components/`, views under `src/views/`)
- Routes are defined in `src/router/index.ts`
# Arletta Gym — Landing (Vue 3 + Vite + Tailwind)

This repository is a demo landing + member/PT front-end built with Vue 3 (script-setup), TypeScript, Vite and Tailwind. It contains a componentized landing site, simple mock auth for local development, and example booking flows used to prototype class bookings, PT packages, and membership checkout flows.

This README reflects the current state of the repository (March 2026) and documents how to run, build and test the project as well as key UX behaviors implemented in the UI.

## Important behavior notes

- Role-aware UI: the app distinguishes between two demo roles: `member` and `pt` (personal trainer). Several CTAs are disabled for `pt` users in the UI (they are trainers, not buyers):
  - "Sign Up Now" on membership pricing cards and CTAs
  - "Book Class" on class cards
  - "Book" in the Weekly Schedule
  - "Book Now" on PT package cards
  These buttons are rendered disabled when the logged-in user's role is `pt`.
- Booking and PT workflows:
  - Shared `BookingConfirmModal` is used for class booking / waitlist flows.
  - PT sessions support a `pending` state where a trainer can propose a PT session and a member must confirm; members can Accept or Decline from their Upcoming tab.
  - Some classes may include an optional `zoomLink`. The UI shows a "View Zoom" CTA only when the class has started and a `zoomLink` exists.
- Payments: membership and PT package CTAs open a small payment modal that currently uses a placeholder (simulated) checkout (Midtrans placeholder). No real payment integration or server-side tokenization is implemented.
- Health policy gating: signup is gated behind a Health Policy modal that must be accepted before creating an account in the demo sign-up flow.
- Particle background: `ParticleBackground` (three.js) is used and intentionally moved to be a single parent instance for sections that need it (to reduce multiple heavy renders).

## Quick links (code locations)

- Views: `src/views/`
- Components: `src/components/` (landing sections under `src/components/landing/`)
- Booking UI: `src/components/booking/BookingConfirmModal.vue`, `OnlineClassModal.vue`, `CancelConfirmModal.vue`
- Auth (demo): `src/services/mockAuth.js`, `src/stores/auth.ts`
- Booking store & sample data: `src/stores/booking.ts`

## Demo accounts (local/dev only)

Use these test accounts on the `/login` page (provided by the local mock auth service):

- Member
  - email: `member@example.com`
  - password: `memberpass`

- Personal Trainer (PT)
  - email: `pt@example.com`
  - password: `ptpass`

These are in-memory demo accounts used for local development. Replace `mockAuth` with your real backend when integrating production authentication.

## Getting started

Install dependencies:

```powershell
npm install
```

Start dev server (hot-reload):

```powershell
npm run dev
```

Build for production (type-check + vite build):

```powershell
npm run build
```

Preview the production build locally:

```powershell
npm run preview
```

Run unit tests (Vitest):

```powershell
npm run test:unit
```

Run e2e tests (Playwright):

```powershell
npx playwright install
npm run build
npm run test:e2e
```

Lint and format:

```powershell
npm run lint
npm run format
```

## Files & patterns to know

- `src/stores/auth.ts` — small Pinia-like or reactive auth state used by the UI (holds `user` and `isLoggedIn`).
- `src/stores/booking.ts` — demo booking store containing `bookedClasses`, `waitingList`, `ptSessions`, and helper functions (also contains sample/dummy data used by `MemberSchedule`).
- `src/components/booking/BookingConfirmModal.vue` — shared booking modal for class booking & waitlist flows.
- `src/components/booking/OnlineClassModal.vue` — shows join/waitlist or Zoom link if available.
- `src/components/landing/membership/PricingCard.vue` — membership pricing card used on the membership page.
- `src/components/landing/trainers/PTPackageCard.vue` — PT package card used on the trainers page.

## Development & UX conventions

- Tailwind uses paren-style custom property references in this project (e.g. `text-(--primary)`). Keep that convention when adding styles.
- Use `BookingConfirmModal` when adding new booking entry points so behavior stays consistent.
- Use `useToast()` (PrimeVue) for notifications; Toast is registered globally in `src/main.ts` and included in `src/App.vue`.

## Known limitations / next steps

- Payment integration: current flow is a placeholder. For production you need server-side Midtrans tokenization / redirect or integrate a client-side payment widget with a backend.
- Zoom link reveal: currently the demo shows `zoomLink` in sample data. In production, your backend should populate `zoomLink` when appropriate (e.g., at class start) and notify clients (websocket or polling) if you want real-time behavior.
- Auth & persistence: `mockAuth` is in-memory for demo purposes; replace with a proper auth server and persistent storage for sessions.

If you'd like, I can:
- Add tooltips to disabled CTAs explaining why they're disabled (recommended UX improvement).
- Add unit tests covering the main booking flows (book, join waitlist, PT pending confirm).
- Scaffold a minimal server example to demonstrate Midtrans token flow (separate repo or folder).

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-change`
3. Commit your changes: `git commit -m 'feat: description'`
4. Push and open a PR

## License

MIT — see the repository license file (if present).

---

If you'd like, I can also add a short CONTRIBUTING.md with lint/pre-commit instructions and a small checklist for PRs.
