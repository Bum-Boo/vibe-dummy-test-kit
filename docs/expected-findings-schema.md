# Expected Findings Schema

Expected findings files define deterministic ground truth for BTS_sec report comparison. They should be easy for scripts to parse and clear enough for humans to review.

Current scaffold scripts still support the earlier expected YAML shape used by the implemented stages. New or migrated stages should follow this standard format.

## Required Fields

```yaml
schema_version: "1.0"
stage: stage-04-access-control
expected_summary:
  critical: 0
  high: 3
  medium: 0
  low: 0
  info: 0
findings: []
allowed_false_positives: []
severity_tolerance:
  default: exact
report_quality_checks:
  executive_summary_required: false
  plain_language_required: true
  korean_lesson_required: true
  must_include: []
  must_not_include: []
```

## Field Reference

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `schema_version` | string | yes | Schema version. Use `"1.0"`. |
| `stage` | string | yes | Stable stage ID. |
| `expected_summary` | object | yes | Expected count by severity. |
| `findings` | list | yes | Expected finding ground truth. |
| `allowed_false_positives` | list | yes | Findings that may appear without failing comparison. Use sparingly. |
| `severity_tolerance` | object | yes | How strictly severity must match. |
| `report_quality_checks` | object | yes | Plain-language and wording requirements for report validation. |

## Expected Finding

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
  must_include:
    - object-level authorization
    - ownership check
    - route parameter ID
  must_not_include:
    - SQL injection
```

Required finding fields:

- `id`
- `title`
- `severity`
- `category`
- `file`
- `evidence`
- `must_include`
- `must_not_include`

Optional finding fields:

- `line`
- `route`

## Severity Tolerance

Use `exact` by default. Only relax tolerance when a scanner legitimately reports a neighboring severity and that behavior is documented.

```yaml
severity_tolerance:
  default: exact
  per_finding:
    CONFIG-002: allow_more_severe
```

Allowed values:

- `exact`
- `allow_more_severe`
- `allow_less_severe`

## Report Quality Checks

Report quality checks validate wording, not only finding IDs.

```yaml
report_quality_checks:
  executive_summary_required: false
  plain_language_required: true
  korean_lesson_required: true
  must_include:
    - object-level authorization
    - changing the URL parameter
  must_not_include:
    - SQL injection
```

## Complete Example

See [Stage 04 expected findings example](examples/stage-04-access-control.expected.example.yaml).

