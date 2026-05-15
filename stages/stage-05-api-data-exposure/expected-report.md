# Expected Report: Stage 05 API Data Exposure and Mass Assignment

BTS_sec should report APIs that return sensitive internal fields and APIs that trust client request bodies during updates. The report should explain both the technical pattern and the plain-language risk.

| ID | Finding | Severity | Evidence | Plain-Language Risk | Safe Fix |
| --- | --- | --- | --- | --- | --- |
| API-001 | Excessive data exposure in user detail endpoint | High | `res.json({ user });` | The API sends more user data than the frontend needs. | Return a response DTO or serializer with only public fields. |
| API-002 | `passwordHash` or `refreshToken` returned in API response | High | `passwordHash`, `refreshToken` | Password hashes and session tokens should never leave the server. | Strip sensitive fields before calling `res.json`. |
| API-003 | Mass assignment risk from direct request body update | High | `updateUserDirectly(session.user.id, req.body)` | A client can send extra fields that the UI never intended to edit. | Build an allowlist object before updating. |
| API-004 | Privileged fields modifiable by client input | High | `role`, `plan`, `credit`, `isAdmin`, `emailVerified` | Users may upgrade themselves or mark privileged account state as true. | Only accept editable profile fields such as `displayName` and `portfolioTitle`. |

## Safe Contrast

`PATCH /api/users/me/safe` should not be flagged for mass assignment. It copies only:

- `displayName`
- `portfolioTitle`

The safe pattern is:

```ts
const allowedChanges = {
  displayName: String(req.body.displayName ?? ""),
  portfolioTitle: String(req.body.portfolioTitle ?? "")
};
```

## Expected Summary

- Critical: 0
- High: 4
- Medium: 0
- Low: 0
- Info: 0

