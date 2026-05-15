# Expected Report: Stage 10 Chained Realistic SaaS

## Executive Summary

Overall risk: **Critical**.

Multiple issues combine into cross-user data exposure and stored content injection risk. A user may access another user's project by changing an ID in the route. AI-generated content is rendered as trusted HTML in public portfolio pages. Uploaded files are publicly hosted without adequate validation. Privileged-looking values appear in browser-accessible code. The combined chain is more serious than any single finding because it lets a normal user discover data, influence stored public content, and reach admin-like surfaces in one local SaaS flow.

## Individual Findings

| ID | Finding | Severity | Evidence | Plain-Language Risk | Safe Fix |
| --- | --- | --- | --- | --- | --- |
| CHAIN-001 | Exposed privileged-looking key in frontend | Critical | `NEXT_PUBLIC_PORTFOLIO_SERVICE_ROLE_KEY` | Browser-visible code contains a service-role-like fake key. | Keep privileged values server-only and call backend routes for privileged actions. |
| CHAIN-002 | Project IDOR / missing ownership check | High | `const project = findProjectById(id);` | Alice can change the project ID to `project-bob` and read Bob's project. | Query by `{ id, ownerId: session.user.id }` or `{ id, orgId }`. |
| CHAIN-003 | AI-generated HTML rendered unsafely | High | `${project.aiDescriptionHtml}` | AI output is treated as trusted HTML on a public page. | Render AI output as text, use templates, or sanitize reviewed HTML. |
| CHAIN-004 | Unsafe public file upload | High | ``writeFile(`./public/uploads/${filename}`, buffer)`` | Uploaded files are saved under a public directory using weak validation. | Use generated names, size/MIME/extension checks, and private MinIO/local storage. |
| CHAIN-005 | Frontend-only admin protection | High | `currentUser.isAdmin === true`, `req.body.isAdmin === true` | UI checks and client-supplied roles can be bypassed. | Check admin role from trusted server-side session data. |
| CHAIN-006 | Overly permissive CORS/server config | High | `origin: "*"` | Browser calls from any origin are allowed for the local API. | Restrict CORS to trusted local origins and tighten reverse proxy headers. |
| CHAIN-007 | Excessive data exposure | High | `res.json({ user });` | API returns password hash, refresh token, and billing-like fields. | Return a public DTO with only needed fields. |

## Expected Summary

- Critical: 1 direct finding, overall chain risk Critical
- High: 6
- Medium: 0
- Low: 0
- Info: 0

BTS_sec should include both the individual findings and the executive chain summary above.

