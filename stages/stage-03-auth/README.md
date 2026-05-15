# Stage 03: Weak Authentication and Authorization Boundaries

This stage contains local-only TypeScript route fixtures for authentication and authorization mistakes. It is intentionally vulnerable and should be scanned as code.

All users, passwords, and tokens are deterministic fake training values.

## Intentional Findings

- `AUTH-001`: `/api/admin/users` trusts `req.body.isAdmin === true`.
- `AUTH-002`: `/api/auth/session` decodes a JWT-like token without signature verification.
- `AUTH-003`: `/api/auth/login` has no visible rate limiting or brute-force protection.
- `AUTH-004`: `/api/auth/reset-password` stores and accepts reset tokens without expiration checks.
- `AUTH-005`: middleware protects page paths but misses `/api` routes.

## Manual Locations

- `src/vulnerable-auth-routes.ts`: route handlers with the weak auth patterns.
- `src/middleware.ts`: page-only middleware that does not protect API routes.
- `src/server.ts`: route registry for the vulnerable API examples.
- `src/demo-data.ts`: deterministic fake local users, passwords, and token fixture.

## Safety

Do not add real JWT secrets, real reset email delivery, real OAuth, or public deployment instructions. These examples are deliberately small so learners can read the mistake and the safe pattern side by side.

