# Mock API

The whole app runs on mock data for now, served over real HTTP. Requests appear in the browser's Network tab with real status codes, latency and cookies. Nothing is stored, and data resets when the server restarts.

## How it works

The API is written as [MSW](https://mswjs.io) handlers in `handlers/`.

MSW normally runs in a browser service worker. This project does not do that, because every student price would then sit in the client bundle, which breaks F-103. Instead, `src/app/api/mock/[...path]/route.ts` runs the handlers on the server through MSW's `getResponse`:

```
Browser → axios → GET /api/mock/deals → route handler → network.ts (latency, faults) → MSW handlers
Server Component → serverGet → MSW handlers
```

## Behaving like the real server

The contract is in `docs/07-tech-stack-and-conventions.md`, section 6. The mock strips student prices for unverified viewers, generates codes, holds expiry, validates request bodies and rejects unverified claims, so the UI cannot quietly depend on client-side rules.

Approving a claim runs the full Workflow 3: it creates the completed order, logs commission to an append-only ledger, applies the hold at the threshold, and makes the PDF receipt available. Staff endpoints check role, store and branch. The defaults used for open decisions are listed in `docs/06-decisions-and-open-questions.md`, Part 5.

`seed/activity.ts` holds the demo staff accounts and the demo store's history.

## Trying loading and error states

Use **Network** in the Dev panel. Every field is on one page at `/dev/fields`, for review.


| Mode | Effect |
|---|---|
| Normal | 200 to 600 ms per request |
| Slow | 3 seconds per request |
| Failing | Every request returns 503 |

Turn off your connection, or use DevTools offline mode, to see the offline states.

## Adding an endpoint

1. Add a function in `handlers/`. Throw `HttpError`, or `invalid()` and `notFound()`, for failures.
2. Validate the body with `readJson(request, schema)`.
3. Add it to the list in `handlers/index.ts`, with fixed paths before `:id` paths.
4. Put any new sample data in `seed/`. All of it is `[SAMPLE]`.

## Going live

- Set `NEXT_PUBLIC_API_URL` to the real API. The mock then answers 404 and is bypassed.
- To remove it: delete `src/mocks`, `src/app/api/mock` and `src/features/dev`, then uninstall `msw`.

## Limits on a deployed site

Data lives in server memory. On serverless hosting each instance has its own copy and resets often, so a student could appear signed out between requests. Use a single long-running server for demos, or expect to sign up again.

The Dev panel stays off in production builds unless `NEXT_PUBLIC_DEV_TOOLS=true`. Without it, no one can play the cashier or admin. Anyone with the link can use it, so leave it off for public links.
