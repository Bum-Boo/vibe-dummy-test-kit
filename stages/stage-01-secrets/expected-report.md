# Expected Report: Stage 01 Exposed Secrets

BTS_sec should report the following fake secret exposures. All values are intentionally fake and used only for scanner validation.

| ID | Expected finding | Severity |
| --- | --- | --- |
| SECRET-001 | Service-role-like key in frontend-accessible code | Critical |
| SECRET-002 | Secret-like value in README | High |
| SECRET-003 | Secret-like value in CI workflow | High |
| SECRET-004 | Secret-like value in built static JS | Critical |
| SECRET-005 | Database URL in config | High |

Required report language:

- The exposed values are fake training credentials.
- Privileged values must not be placed in frontend-accessible code or `NEXT_PUBLIC_` variables.
- Values committed to documentation, CI files, config files, or build artifacts should be treated as exposed.
- In a real project, exposed credentials must be revoked and rotated.

