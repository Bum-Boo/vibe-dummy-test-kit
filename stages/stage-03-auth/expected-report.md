# Expected Report: Stage 03 Weak Authentication and Authorization

BTS_sec should report five intentional authentication and authorization boundary issues.

| ID | Finding | Severity | Evidence | Impact | Safe Fix |
| --- | --- | --- | --- | --- | --- |
| AUTH-001 | Admin route relies on client-provided role | High | `req.body.isAdmin === true` | A caller can claim to be admin and read admin-only data. | Load the user from a trusted server-side session and check the stored role. |
| AUTH-002 | Token decoded without verification | High | `decodeJwtWithoutVerification(token)` | Tampered tokens may be accepted as authenticated sessions. | Verify signature, issuer, audience, and expiration before trusting claims. |
| AUTH-003 | Login endpoint has no visible rate limiting | Medium | `no rateLimit middleware or brute-force counter` | Attackers can repeatedly guess passwords in the local demo flow. | Add per-user and per-IP rate limiting with Redis-backed counters. |
| AUTH-004 | Password reset token missing expiration | Medium | `passwordResetTokens.set(token, { userId: user.id })` | Old reset tokens can remain usable indefinitely. | Store `expiresAt`, check it on use, and delete used or expired tokens. |
| AUTH-005 | Middleware does not protect API route | High | `Intentionally missing: /api routes are not checked here.` | Pages may look protected while direct API calls remain exposed. | Apply authorization checks inside API handlers or shared API middleware. |

## Expected Summary

- Critical: 0
- High: 3
- Medium: 2
- Low: 0
- Info: 0

No real JWT secret, OAuth provider, email service, or live credential should appear in this stage.

