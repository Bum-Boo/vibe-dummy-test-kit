# Stage 05: API Data Exposure and Mass Assignment

This stage demonstrates two common API mistakes:

- Returning internal user records with sensitive fields.
- Passing `req.body` directly into an update function, allowing mass assignment.

All data is fake, deterministic, and local-only.

## Routes

Vulnerable examples:

- `GET /api/users/:id`
- `PATCH /api/users/me`
- `GET /api/admin/export`

Safe contrast:

- `GET /api/users/:id/safe`
- `PATCH /api/users/me/safe`

## Manual Demo

Run:

```bash
pnpm exec tsx stages/stage-05-api-data-exposure/src/manual-demo.ts
```

Expected behavior:

- The vulnerable user detail response includes `passwordHash`, `refreshToken`, `internalMemo`, and `billingCustomerId`.
- The vulnerable update accepts privileged fields like `role`, `plan`, `credit`, `isAdmin`, and `emailVerified`.
- The safe update only applies `displayName` and `portfolioTitle`.

