# Stage 11: Fixed Realistic SaaS

This stage preserves the Stage 10 AI portfolio builder workflow while removing or mitigating the intentional vulnerabilities.

## Preserved Features

- Demo login as Alice, Bob, and Admin.
- Project create/list/detail.
- Private image upload.
- AI-generated portfolio description.
- Public portfolio page.
- Server-side admin dashboard.
- Plan/billing-like fields through safe DTOs.
- Safer reverse proxy config.
- Local private storage path.

## Manual Demo

Run:

```bash
pnpm exec tsx stages/stage-11-fixed/src/manual-demo.ts
```

The demo verifies:

- Alice and Bob can log in.
- Alice can list her projects.
- Alice cannot read Bob's project.
- Bob can read his own project.
- Uploads use private storage and an object key.
- AI content is rendered as escaped text.
- Alice cannot open the admin dashboard.
- Admin can open the admin dashboard.
- User detail responses omit password hashes, refresh tokens, and raw billing IDs.

Clear generated private upload files with:

```bash
pnpm exec tsx scripts/reset-uploads.ts
```

