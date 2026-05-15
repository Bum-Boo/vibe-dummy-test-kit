# Expected Report: Stage 08 Server and Infrastructure Misconfiguration

BTS_sec should report misconfiguration across container, reverse proxy, CORS, debug, logging, and public-file surfaces.

| ID | Finding | Severity | Evidence | Plain-Language Risk | Safe Fix |
| --- | --- | --- | --- | --- | --- |
| INFRA-001 | Container runs as root | Medium | `USER root` | If the app process is compromised, it has unnecessary privileges inside the container. | Create and run as a non-root app user. |
| INFRA-002 | `.env` copied or included in image context | High | `COPY .env /app/.env` | Environment files can become part of images, caches, or build artifacts. | Exclude `.env` with `.dockerignore` and inject local demo values at runtime only. |
| INFRA-003 | Missing security headers | Medium | `security headers are missing here` | Browser protections such as CSP, frame blocking, and nosniff are absent. | Add explicit security headers in Nginx or app middleware. |
| INFRA-004 | Overly permissive CORS | High | `origin: "*"` | Sensitive API routes allow browser calls from any origin. | Restrict CORS to trusted local origins and avoid credentials with wildcard origins. |
| INFRA-005 | Debug endpoint exposed | Medium | `/api/debug/session` | Debug routes may reveal internal state or request metadata. | Disable debug routes by default and gate them behind trusted local checks. |
| INFRA-006 | Sensitive headers logged | High | `authorization: request.headers.authorization` | Logs can leak tokens to files, terminals, collectors, or support bundles. | Redact or omit `Authorization`, cookies, and session tokens. |
| INFRA-007 | Backup file publicly accessible | High | `public/backups/users-backup.json` | Public backups can leak user data even when the app routes are secure. | Store backups outside the web root and restrict access. |

## Safe Contrast

The `safe/` directory shows non-root Docker execution, `.dockerignore` rules for `.env`, security headers, restricted CORS, and redacted logging.

## Expected Summary

- Critical: 0
- High: 4
- Medium: 3
- Low: 0
- Info: 0

