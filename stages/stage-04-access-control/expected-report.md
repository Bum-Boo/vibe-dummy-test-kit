# Expected Report: Stage 04 Broken Access Control / IDOR

BTS_sec should report missing object-level authorization on the vulnerable routes. The report must describe an ownership check problem involving a route parameter ID. It should mention that a user can change the URL parameter to access another user's object. It must not call this SQL injection.

| ID | Finding | Severity | Evidence | Impact | Safe Fix |
| --- | --- | --- | --- | --- | --- |
| BAC-001 | Project detail endpoint missing ownership check | High | `const project = findProjectById(id);` | Alice can change the URL parameter to `project-bob` and read Bob's project. | Query by both object ID and owner, such as `{ id, ownerId: session.user.id }`. |
| BAC-002 | Order detail endpoint missing ownership check | High | `const order = findOrderById(id);` | Alice can change the URL parameter to `order-bob` and read Bob's order. | Query by both object ID and user, such as `{ id, userId: session.user.id }`. |
| BAC-003 | Project delete endpoint missing ownership check | High | `const deletedProject = deleteProjectById(id);` | Alice can change the URL parameter and delete Bob's project in local demo data. | Check ownership before deletion, or delete with both `id` and `ownerId`. |

## Negative Assertion

`BAC-004` should not be reported. `GET /api/my/projects` is the safe route because it loads the current session and calls `findProjectsByOwnerId(session.user.id)`.

## Expected Summary

- Critical: 0
- High: 3
- Medium: 0
- Low: 0
- Info: 0

