# Stage 08: Server and Infrastructure Misconfiguration

This stage demonstrates local-only Docker, reverse proxy, CORS, debug route, logging, and public-file mistakes. It is designed for code/config scanning, not public deployment.

All secrets and backup content are fake training values.

## Vulnerable Examples

- `Dockerfile`: runs as root and copies `.env` into the image.
- `docker-compose.yml`: exposes local database/admin ports unnecessarily.
- `nginx/default.conf`: omits common security headers.
- `src/server-config.ts`: uses `origin: "*"` for sensitive API routes and exposes `/api/debug/session`.
- `src/request-logger.ts`: logs `Authorization` and `sessionToken`.
- `public/backups/users-backup.json`: fake backup placed under a public directory.

## Safe Contrast

The `safe/` directory shows practical safer patterns:

- non-root Docker user
- `.dockerignore` excluding `.env`
- Nginx security headers
- restricted CORS origin
- logging that omits sensitive tokens

## Local-Only Rule

Any ports in this stage are bound to `127.0.0.1` and are for scanner training only. Do not add public deployment instructions for these misconfigured examples.

