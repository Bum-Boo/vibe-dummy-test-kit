# Stage 04: Broken Access Control / IDOR

This stage demonstrates object-level authorization mistakes. The vulnerable routes read a route parameter ID, query local demo data by that ID only, and return or modify the object without checking ownership.

All behavior is local-only and uses deterministic Alice/Bob demo data.

## Routes

Vulnerable examples:

- `GET /api/projects/:id`
- `GET /api/orders/:id`
- `DELETE /api/projects/:id`

Safe contrast:

- `GET /api/my/projects`

## Manual Demo

Run:

```bash
pnpm exec tsx stages/stage-04-access-control/src/manual-demo.ts
```

Expected behavior:

- Alice can read Bob's project through `GET /api/projects/project-bob`.
- Alice only sees her own project through `GET /api/my/projects`.

## Why This Matters

This is not SQL injection. The bug is missing object-level authorization: the route accepts a route parameter ID and does not verify that the current user owns the object.

