# Arletta Gym — Landing (Vue 3 + Vite + Tailwind)

A modern, premium dark-themed gym landing template built with Vue 3, Vite and Tailwind CSS. This repo contains a fully componentized landing site (Home, Membership, Class Programs, Personal Trainers, About), auth UI, and demo fixtures to speed up development.

## Quick links

- Source: `src/` (components under `src/components/`, views under `src/views/`)
- Routes are defined in `src/router/index.ts`
- Mock/demo auth lives in `src/services/mockAuth.js`
- Lightweight auth state in `src/stores/auth.ts`

Note: Recent UI and UX improvements in this repo include consistent booking modals, toast notifications, and trainer booking via WhatsApp — see Features below.

## Demo accounts (local/dev only)

Use these test accounts on the `/login` page (provided by the local mock auth service):

- Member
  - email: `member@example.com`
  - password: `memberpass`

- Personal Trainer (PT)
  - email: `pt@example.com`
  - password: `ptpass`

These are in-memory demo accounts and intended only for local development and demos. Replace with a real backend when ready.

## Features

- Vue 3 (script-setup) + TypeScript
- Vite for dev server & build
- Tailwind CSS for utility-first styling; CSS custom properties used for tokens
- PrimeVue for small UI primitives (Button, InputText, Password, Menu)
- Componentized landing sections (Hero, CTA, sections per page)
- Simple mock auth + shared auth store for demo login flows

Recent / notable features implemented in this repository:

- Booking UX consistency: a shared `BookingConfirmModal` component is used across landing class cards (`src/components/landing/class/ClassCards.vue`), weekly schedule (`src/components/landing/class/WeeklySchedule.vue`) and the member booking tab (`src/components/booking/BookingConfirmModal.vue`) so the booking experience (class details, spots left, waitlist flow, time conflict warning, cancellation policy) is consistent.
- Trainers booking: trainer detail modal (`src/components/landing/trainers/TrainerModal.vue`) opens a WhatsApp chat for scheduling personal training (external to the system). This is deliberate — trainer scheduling is done via WhatsApp/phone.
- Auth improvements: a `ForgotPassword` page and an Email Verification modal (shown after signup) were added to the auth flow for a better signup/reset experience. The route `/forgot-password` is available.
- Toast notifications: PrimeVue Toast is registered globally and used across the app for key events (login success/failure, booking confirmations, waitlist joins, cancellations, PT session updates, and logout notices).
- Membership CTA/payment flow: membership CTAs no longer always route to the signup page when the user is already logged in — a small payment selection modal (placeholder for Midtrans integration) appears for logged-in users.
- Role-aware navigation and guards: many landing CTAs and booking flows check the auth state and user role (member vs PT). PTs are prevented from booking classes in the UI (they act as trainers).

## Getting started

Install dependencies:

```powershell
npm install
```

Start dev server (hot-reload):

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
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

Lint the codebase:

```powershell
npm run lint
```

## Development notes & conventions

- Tailwind arbitrary values use the paren form for CSS custom properties, e.g. `text-(--primary)`, `bg-(--bg-dark)`. This repository has been normalized to that style to satisfy Tailwind linting.
- `defineProps` and `defineEmits` are used as compiler macros (do not import them). In templates use `$emit(...)` to invoke emits unless you assign `const emit = defineEmits(...)` and use it in script.
- Demo auth (`src/services/mockAuth.js`) is intentionally simple — it returns a user object without real tokens. Swap it for a real auth service when integrating a backend.

Additional developer notes:

- The booking modal component used across the project is `src/components/booking/BookingConfirmModal.vue`. Use it when introducing new booking UIs to keep behavior identical.
- Trainer booking intentionally opens a WhatsApp link (see `src/components/landing/trainers/TrainerModal.vue`) — update the placeholder number there when integrating real trainer contact info.
- PrimeVue's Toast service is registered in `src/main.ts` and the `Toast` component is included in `src/App.vue` — use `useToast()` in components to push messages.
- The repo uses Tailwind CSS and CSS custom properties (parens style) for tokenization (e.g., `text-(--primary)`). Keep that convention to avoid Tailwind extraction issues.

## File map (high level)

- `src/components/layout/` — `AppNavbar.vue`, `AppFooter.vue`
- `src/components/landing/` — per-page component folders (`about/`, `class/`, `membership/`, `trainers/`)
- `src/components/auth/` — `LoginForm.vue`, `SignUpForm.vue`
- `src/services/` — `mockAuth.js`, `api.js` (placeholder)
- `src/stores/` — `auth.ts` (small in-memory reactive store)

Other notable files:

- `src/components/booking/BookingConfirmModal.vue` — shared booking confirmation UI used across landing and member flows
- `src/components/landing/trainers/TrainerModal.vue` — trainer profile modal which links out to WhatsApp for booking
- `src/views/auth/ForgotPassword.vue` — forgot password page
- `src/components/auth/EmailVerificationModal.vue` — shown after signup for resending verification
- `src/views/member/MemberSchedule.vue` — member schedule UI and booking management (uses `BookingConfirmModal`)

## Suggestions & next steps

- Replace `mockAuth` with a real auth backend and persist session (localStorage/cookies) if you need persistence across reloads.
- Add more unit/e2e tests for critical flows (signup, login, booking classes).
- Consider extracting theme tokens into a dedicated JS/JSON theme file if you plan to support multiple themes.

If you'd like, I can also:

- Add a small CONTRIBUTING note with code style and commit hooks.
- Wire a simple Midtrans payment demo integration (client-only placeholder) for the membership payment modal.
- Add a one-click demo panel to autofill demo credentials on the login page.

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-change`
3. Commit your changes: `git commit -m 'feat: description'`
4. Push and open a PR

## License

MIT — see the repository license file (if present).

---

Small, focused template designed for demos and rapid iterations. If you want, I can add a one-click demo panel to the login page that lists the demo credentials and a button to autofill them.
