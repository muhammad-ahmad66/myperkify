# MyPerkify

A free, verified student discount marketplace for Pakistan. Students verify once, then claim deals at shop counters with a live code or order online.

## Getting started

Needs Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Pages so far

| Area | Routes |
| --- | --- |
| Public | `/`, `/deals`, `/deals/[slug]`, `/stores/[slug]`, `/business`, `/business/register`, `/about`, `/help`, `/contact`, `/privacy`, `/terms` |
| Sign in | `/get-verified`, `/sign-in` |
| Student | `/account`, `/account/orders/[id]`, `/cart`, `/checkout`, `/orders/[id]/confirmed` |
| Merchant | `/store-manager`, `/claims`, `/deals`, `/orders`, `/ledger`, `/settings` under it |
| Admin | `/admin/verifications`, `/admin/merchants`, `/admin/settlements` |

Only the homepage, deal page and sign-up are approved designs. Every form field comes from `src/components/ui/form`, and `/dev/fields` shows them all.

Demo staff accounts are in `src/mocks/seed/activity.ts`. The Dev panel can switch to any of them.

## Trying the flows

The whole app runs on mock data for now, served over real HTTP by [MSW](https://mswjs.io) handlers in [`src/mocks`](src/mocks/README.md). Requests appear in the browser's Network tab, and the data resets when the server restarts.

In development, the **Dev** button at the bottom right plays the people who are not on screen:

- switch between visitor, pending student, verified student, cashier, owner and admin
- show the emailed sign-up code
- approve a claim as the cashier
- approve or reject a student card as the admin
- slow down or break the network, to see loading and error states

To go through a claim, open two browser profiles: one as **Verified** on a deal page, the other as **Cashier** on the claims page.

## Project structure

```
src/
├── app/            Routes only. Thin pages that compose features.
├── components/
│   ├── ui/         Design system: Button, Field, Stamp, Dialog...
│   └── layout/     AppBar, Footer, TabBar, providers
├── features/       One folder per domain: api, hooks, schemas, types, components
├── lib/            API client, query setup, formatting, routes
├── mocks/          Stand-in API until the backend is chosen
├── stores/         Zustand stores
└── styles/         tokens.css and globals.css
```

Each component has its own folder with a `.tsx`, a `.module.css` and an `index.ts`.

Data flows one way: component → hook (TanStack Query) → `features/*/api.ts` → `lib/api/client.ts`.

## Stack

| Job                   | Library                               |
| --------------------- | ------------------------------------- |
| Framework             | Next.js App Router, TypeScript strict |
| Styling               | CSS Modules with design tokens        |
| Accessible primitives | Radix UI                              |
| API calls             | axios                                 |
| Mock data             | MSW                                   |
| Server data           | TanStack Query                        |
| Client state          | Zustand                               |
| Forms and validation  | React Hook Form, Zod                  |
| Toasts                | Sonner                                |
| Tests                 | Vitest, Testing Library, Playwright   |

## Commands

| Command            | Does                                         |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the dev server                         |
| `npm run build`    | Production build                             |
| `npm run check`    | Typecheck, lint and unit tests               |
| `npm run test:e2e` | Playwright flows at desktop and phone widths |
| `npm run format`   | Format with Prettier                         |

## Rules that matter

- Student prices never reach an unverified user, in any payload. Hiding them with CSS is not enough.
- Pricing, gating, codes, expiry and commission run on the server.
- Component CSS uses tokens only. No Tailwind, and no component libraries with their own styling.

The brief, design system and conventions live in `docs/`, which is kept out of the repository. Ask the project owner for a copy.
