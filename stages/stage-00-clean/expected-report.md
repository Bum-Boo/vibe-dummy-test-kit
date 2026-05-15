# Expected Report: Stage 00 Clean Baseline

Stage 00 is expected to produce no serious BTS_sec findings.

Expected severity counts:

| Severity | Expected count |
| --- | ---: |
| Critical | 0 |
| High | 0 |
| Medium | 0 ideally |
| Low | 0, or clearly informational only |
| Info | Acceptable if the finding is about lab metadata or local-only configuration |

If BTS_sec reports critical or high findings, treat the result as a false-positive candidate or a harness configuration issue until verified.

The stage intentionally includes safe patterns:

- Explicit demo session selection.
- Ownership checks on private project routes.
- Admin checks on admin routes.
- Public pages that only return public projects.
- Upload metadata validation stub.
- Deterministic local AI text placeholder.
- No real secrets, OAuth, payments, cloud storage, or AI provider calls.

