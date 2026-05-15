# Stage 10: Chained Realistic SaaS

This is the final vulnerable demo stage. It combines earlier staircase mistakes into a realistic local "AI portfolio builder SaaS" flow.

All data, keys, uploads, and AI responses are fake local training fixtures.

## Demo Features

- Demo login as Alice, Bob, and Admin.
- Project create/list/detail.
- Image upload.
- AI-generated portfolio description.
- Public portfolio page.
- Admin dashboard.
- Plan/billing-like fields.
- Reverse proxy CORS config.
- Local public upload storage.

## Manual Demo

Run:

```bash
pnpm exec tsx stages/stage-10-chained-saas/src/manual-demo.ts
```

The demo shows:

- Alice and Bob can log in as deterministic local users.
- Alice can list her projects.
- Alice can read Bob's project by changing the project ID.
- Alice can upload a harmless SVG that is immediately public.
- AI-generated HTML is rendered into a public portfolio page.
- Alice can access admin data by sending `isAdmin: true`.
- A user detail endpoint returns plan, billing, password hash, and refresh token fields.

Clear generated upload files with:

```bash
pnpm exec tsx scripts/reset-uploads.ts
```

## Safety

Do not add real external integrations, real API keys, real cloud storage, or harmful payloads. This stage exists to demonstrate how small local-only mistakes combine into a severe SaaS risk chain.

