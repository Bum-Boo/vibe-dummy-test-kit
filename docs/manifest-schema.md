# Stage Manifest Schema

This schema describes the canonical stage manifest format for BTS_sec ground truth. It is intentionally YAML-first and beginner-readable.

Current scaffold scripts still support the earlier `manifest.yaml` shape used by the implemented stages. New or migrated stages should follow this standard format.

## Required Fields

```yaml
schema_version: "1.0"
stage: stage-04-access-control
name: Broken Access Control / IDOR
difficulty: intermediate
description: Object-level authorization mistakes using route parameter IDs.
intended_vulnerabilities: []
safe_contrasts: []
demo_steps: []
beginner_summary_ko: "이 단계는 URL의 ID를 바꿔 다른 사용자의 데이터에 접근하는 문제를 보여줍니다."
```

## Field Reference

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `schema_version` | string | yes | Schema version. Use `"1.0"`. |
| `stage` | string | yes | Stable stage ID, matching the directory name. |
| `name` | string | yes | Human-readable stage name. |
| `difficulty` | string | yes | One of `clean`, `beginner`, `intermediate`, `advanced`, `chained`, `fixed`. |
| `description` | string | yes | Short deterministic stage purpose. |
| `intended_vulnerabilities` | list | yes | Ground-truth vulnerabilities intentionally present in the stage. |
| `safe_contrasts` | list | yes | Safe examples that should not be reported as findings. |
| `demo_steps` | list | yes | Manual or scripted steps for reproducing the stage behavior. |
| `beginner_summary_ko` | string | yes | Korean beginner explanation for the stage. |
| `tags` | list | no | Optional scanner or lesson tags. |
| `local_only` | boolean | no | Should be `true` for this repository. |
| `deterministic_notes` | list | no | Notes about fixed users, IDs, seeded data, and fake values. |

## Intended Vulnerability

Each item in `intended_vulnerabilities` must use a stable ID and precise evidence.

```yaml
- id: BAC-001
  title: Project detail endpoint missing ownership check
  severity: high
  category: access-control
  file: stages/stage-04-access-control/src/access-control-routes.ts
  line: 9
  route: GET /api/projects/:id
  evidence:
    - const project = findProjectById(id);
  expected_report:
    must_include:
      - object-level authorization
      - ownership check
    must_not_include:
      - SQL injection
  fix_summary: Query by both id and ownerId from the trusted session.
```

Required vulnerability fields:

- `id`
- `title`
- `severity`
- `category`
- `file`
- `evidence`
- `expected_report.must_include`
- `expected_report.must_not_include`
- `fix_summary`

Optional vulnerability fields:

- `line`
- `route`

## Safe Contrast

Safe contrasts are important false-positive controls.

```yaml
- id: BAC-004
  title: Safe current-user project list
  file: stages/stage-04-access-control/src/access-control-routes.ts
  route: GET /api/my/projects
  why_safe: Uses the trusted session user ID in findProjectsByOwnerId(session.user.id).
```

## Demo Step

Demo steps should be deterministic and local-only.

```yaml
- title: Alice reads Bob's project through the vulnerable route
  actor: alice
  route: GET /api/projects/project-bob
  expected_result: Bob's project is returned because ownership is not checked.
```

## Complete Example

See [Stage 04 manifest example](examples/stage-04-access-control.manifest.example.yaml).

