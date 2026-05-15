# BTS_sec Staircase Lab

`bts-sec-staircase-lab` is a local-only showcase, documentation site, and benchmark harness for BTS_sec.

It demonstrates how common security mistakes appear in beginner-built full-stack apps, how BTS_sec should report them, and how fixed code should look after remediation. The lab is staged like a staircase: early stages isolate one issue, while later stages combine several mistakes into a realistic AI portfolio builder SaaS.

## What This Repository Shows

- A safe baseline app that should produce no Critical or High findings.
- Intentionally vulnerable local stages for fake secrets, broken access control, unsafe uploads, and chained SaaS risk.
- A fixed version of the chained SaaS app for false-positive and remediation validation.
- Expected findings in YAML so scanner output can be compared automatically.
- Beginner-friendly Korean lessons that explain the issue, impact, manual demo, BTS_sec scan, and fix direction.
- A local dashboard for browsing stages, reports, lessons, and scorecards.
- Presenter-ready scripts for 7-minute, 15-minute, and 60-minute demos.

## MVP Showcase Flow

Use this path when you want to demo the lab quickly without needing a real BTS_sec binary:

```sh
pnpm install
pnpm scan -- --stage stage-04-access-control
pnpm compare -- --stage 04
pnpm score
pnpm dashboard
```

Then open `http://localhost:3000`.

What to show:

1. Open `http://localhost:3000/stages/stage-04`.
2. Run `pnpm exec tsx stages/stage-04-access-control/src/manual-demo.ts`.
3. Show that Alice can access Bob's project through the vulnerable route.
4. Open `http://localhost:3000/reports/stage-04`.
5. Show `BAC-001`, `BAC-002`, and `BAC-003`.
6. Open `http://localhost:3000/stages/stage-11`.
7. Show that the fixed stage expects zero Critical and High findings.

For presenter scripts, use:

- [7-minute demo](docs/demo-7min.md)
- [15-minute demo](docs/demo-15min.md)
- [60-minute workshop](docs/workshop-60min.md)
- [Korean presenter notes](docs/presenter-notes-ko.md)

## Implemented Stages

| Stage | Name | Purpose | Demo Status |
| --- | --- | --- | --- |
| 00 | Clean Baseline | False-positive control with safe ownership checks and safe rendering patterns. | Ready |
| 01 | Exposed Secrets | Fake secrets in frontend, config, docs, CI, and build artifacts. | Ready |
| 04 | Broken Access Control / IDOR | Route parameter IDs are trusted without object-level ownership checks. | Ready |
| 07 | Unsafe File Upload | Original filename, public upload path, weak validation, and safe contrast. | Ready |
| 10 | Chained Realistic SaaS | Multiple issues combined into an AI portfolio builder SaaS scenario. | Ready |
| 11 | Fixed Realistic SaaS | Same SaaS workflow with mitigations applied. | Ready |

Additional stages exist for scanner breadth and future demos: frontend config, auth boundary mistakes, API data exposure, XSS, server misconfiguration, and AI feature risks.

## Safety Rules

- This repository is local-only. Run it on your machine, not on public infrastructure.
- Do not deploy vulnerable stages to the public internet.
- Do not add real secrets, tokens, API keys, cloud credentials, or payment credentials.
- Fake values are intentionally labeled with strings such as `fake_*_for_training_only` or `FAKE_LOCAL_*`.
- Scanner runners only accept known local stage folders from `stages/.stage-order`.
- URL scan arguments must use `localhost`, `127.0.0.1`, or `::1`; external domains and public IPs are rejected before BTS_sec is launched.
- Generated reports go under `reports/generated`; comparison output goes under `reports/comparisons`.

## Local Dashboard

The dashboard is the main showcase surface. It reads stage manifests, expected findings, generated reports, comparison output, and Korean lessons directly from this repository.

```sh
pnpm dashboard
```

Open:

- `http://localhost:3000/` - overview, safety rules, and quick commands.
- `http://localhost:3000/stages` - stage list with topics, difficulty, and expected risk.
- `http://localhost:3000/stages/stage-04` - Stage 04 scenario, demo users, and expected findings.
- `http://localhost:3000/reports/stage-04` - report viewer and comparison result.
- `http://localhost:3000/scoreboard` - PASS/PARTIAL/FAIL benchmark scorecard.

If report files do not exist yet, the dashboard shows the local command needed to generate them.

## BTS_sec Scan Workflow

### Deterministic Scaffold Reports

Use this when BTS_sec is not installed or when you want stable demo output:

```sh
pnpm scan -- --stage stage-04-access-control
pnpm compare -- --stage 04
pnpm score
```

This reads the local fixtures and expected findings, then writes deterministic report files under `reports/generated`.

### Real BTS_sec Runner

Use this when the BTS_sec binary is installed:

```sh
make scan STAGE=04
make compare STAGE=04
make score
```

If `BTS_sec` is not on your `PATH`, set `BTS_SEC_BIN`:

```sh
BTS_SEC_BIN=/path/to/BTS_sec make scan STAGE=04
```

PowerShell:

```powershell
$env:BTS_SEC_BIN = "C:\path\to\BTS_sec.exe"
make scan STAGE=04
```

The runner resolves `STAGE=04` to `stages/stage-04-access-control` and writes:

- `reports/generated/stage-04.report.json`
- `reports/generated/stage-04.report.md`
- `reports/generated/stage-04.scan.log`

If your BTS_sec CLI uses different flags, override the argument template:

```sh
BTS_SEC_ARGS="scan {stage_path} --json-out {json} --markdown-out {markdown}" make scan STAGE=04
```

Available placeholders are `{stage}`, `{stage_short}`, `{stage_path}`, `{json}`, `{markdown}`, and `{log}`.

## Local Infrastructure

The Docker Compose stack is local infrastructure for full-stack security demos:

- PostgreSQL: database examples.
- Redis: rate-limit and throttling examples.
- MinIO: local object storage for upload examples.
- Nginx: reverse proxy and security header examples.

Start it:

```sh
cp .env.example .env
make setup
make up
make ps
```

Stop it:

```sh
make down
```

Reset local state:

```sh
make reset
```

If `make` is unavailable:

```sh
pnpm install
docker compose up -d
docker compose ps
docker compose down
```

Local services:

- PostgreSQL: `127.0.0.1:5432`
- Redis: `127.0.0.1:6379`
- MinIO API: `http://localhost:9000`
- MinIO console: `http://localhost:9001`
- Nginx health: `http://localhost:8080/health`

All values in `.env.example` are deterministic fake local demo values.

## Demo SaaS App

The target app models a safe-by-default AI portfolio builder SaaS. It includes demo users, projects, public portfolio pages, upload placeholders, AI text placeholders, an admin placeholder, and plan-like fields.

Run the API and target frontend locally:

```sh
pnpm --filter @bts-sec/target-api dev
pnpm --filter @bts-sec/target-frontend dev
```

Open:

- Target frontend: `http://localhost:3001`
- Target API health: `http://localhost:4000/health`
- Alice session: `http://localhost:3001/projects?userId=alice`
- Bob session: `http://localhost:3001/projects?userId=bob`
- Admin session: `http://localhost:3001/admin?userId=admin`

No real OAuth, payment provider, cloud storage, or live AI provider is used.

## Lessons And Documentation

Korean lessons are written for non-expert builders and follow a consistent template:

1. What this stage teaches.
2. Normal feature behavior.
3. Vulnerable behavior.
4. Why it is dangerous.
5. How to verify it manually.
6. How to scan with BTS_sec.
7. What phrases to look for in the report.
8. Fix direction.
9. Re-scan after fixing.
10. Key summary.

Useful lesson pages in the dashboard:

- `http://localhost:3000/stages/stage-01/lesson-ko`
- `http://localhost:3000/stages/stage-04/lesson-ko`
- `http://localhost:3000/stages/stage-07/lesson-ko`
- `http://localhost:3000/stages/stage-10/lesson-ko`
- `http://localhost:3000/stages/stage-11/lesson-ko`

Reusable lesson templates:

- `lessons/lesson-template-ko.md`
- `lessons/lesson-template-en.md`

Schema documentation:

- [Manifest schema](docs/manifest-schema.md)
- [Expected findings schema](docs/expected-findings-schema.md)
- [Stage 04 manifest example](docs/examples/stage-04-access-control.manifest.example.yaml)
- [Stage 04 expected findings example](docs/examples/stage-04-access-control.expected.example.yaml)

## Repository Layout

```txt
bts-sec-staircase-lab/
apps/
  lab-dashboard/
  target-frontend/
  target-api/
  mock-llm/
docs/
expected/
infra/
lessons/
reports/
scripts/
stages/
```

Each stage contains:

- `README.md`
- `manifest.yaml`
- `expected-report.md`
- `lesson-ko.md`

Implemented stages also have matching expected finding files in `expected/`.

## Makefile Commands

```txt
make setup              Install pnpm workspace dependencies
make dashboard          Start the local learner dashboard
make up                 Start local Docker Compose infra
make down               Stop local Docker Compose infra
make reset              Clear local uploads, reset Docker volumes, and restart
make reset-uploads      Clear local Stage 07/10/11 upload directories
make logs               Tail Docker Compose service logs
make ps                 Show Docker Compose service status
make scan STAGE=04      Run BTS_sec against a local stage
make scan-all           Run BTS_sec for all known local stages
make compare STAGE=04   Compare generated report with expected findings
make score              Summarize comparison status
make score-json         Print comparison scorecard as JSON
make typecheck          Run TypeScript checks
```

## Current Validation Status

The MVP has been validated with:

- `pnpm install`
- `pnpm typecheck`
- `pnpm --filter @bts-sec/lab-dashboard build`
- `pnpm scan -- --stage stage-04-access-control`
- `pnpm compare -- --stage 04`
- `pnpm scan -- --stage stage-10-chained-saas`
- `pnpm compare -- --stage 10`
- `pnpm scan -- --stage stage-11-fixed`
- `pnpm compare -- --stage 11`
- `pnpm score`

Expected benchmark result: `12/12 stages passed` when deterministic scaffold reports are generated for all implemented stages.
