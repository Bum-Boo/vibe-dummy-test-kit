# BTS_sec Staircase Lab

`bts-sec-staircase-lab` is a local-only educational security lab and benchmark harness for BTS_sec.

The MVP includes implemented local stages for a clean baseline, exposed fake secrets, broken access control, unsafe file upload, a chained SaaS scenario, and a fixed SaaS scenario. It also includes local Docker Compose infrastructure, a dashboard, scan runners, report comparison scripts, Korean lessons, and presenter demo docs.

## Safety Rules

- **Local-only guardrail:** this lab is for `localhost` and repository stage folders only. The scan runners reject unknown stages, path traversal, and non-localhost URL targets.
- Run this repository locally only.
- Do not deploy vulnerable stages to the public internet.
- Do not add real secrets, real tokens, real API keys, or live cloud credentials.
- Do not add features or scripts that attack external systems.
- Keep all demo users, demo data, and scanner outputs deterministic.
- Use fake local values only, clearly labeled as fake.

## Local Setup

Prerequisites:

- Docker with Docker Compose.
- pnpm for workspace scripts.
- `make` if you want to use the Makefile shortcuts.

Fast local MVP check without BTS_sec:

```sh
pnpm install
pnpm scan -- --stage stage-04-access-control
pnpm compare -- --stage 04
pnpm score
pnpm dashboard
```

Then open `http://localhost:3000`.

Start the local infrastructure:

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

Reset local volumes:

```sh
make reset
```

If `make` is unavailable, use Docker Compose and pnpm directly:

```sh
pnpm install
docker compose up -d
docker compose ps
docker compose down
```

## Local Services

The default Compose stack is infrastructure-only:

- PostgreSQL: `127.0.0.1:5432`
- Redis: `127.0.0.1:6379`
- MinIO API: `http://localhost:9000`
- MinIO console: `http://localhost:9001`
- Nginx local proxy foundation: `http://localhost:8080`
- Nginx health: `http://localhost:8080/health`

All credentials in `.env.example` are deterministic fake local demo values.

## Demo SaaS App Flow

The target app models a safe-by-default "AI portfolio builder SaaS" for future staircase stages. It includes deterministic demo users, projects, public portfolio pages, upload placeholders, AI text placeholders, an admin placeholder, and plan fields. It does not use real auth, payment, cloud storage, or AI providers.

Run the API and target frontend locally:

```sh
pnpm --filter @bts-sec/target-api dev
pnpm --filter @bts-sec/target-frontend dev
```

Open:

- Target frontend: `http://localhost:3001`
- Target API health: `http://localhost:4000/health`

Demo sessions are explicit query-string simulations:

- Alice: `http://localhost:3001/projects?userId=alice`
- Bob: `http://localhost:3001/projects?userId=bob`
- Admin: `http://localhost:3001/admin?userId=admin`

The API enforces the safe baseline checks: normal users can read their own projects, public portfolio pages only expose public projects, and admin data requires the Admin demo session.

## Learner Dashboard

The local dashboard reads stage manifests, expected findings, generated reports, and comparison output directly from this repository.

```sh
pnpm dashboard
```

Then open `http://localhost:3000`.

Useful pages:

- `http://localhost:3000/` - overview, safety rules, and workflow commands.
- `http://localhost:3000/stages` - stage list with topics, difficulty, and expected risk.
- `http://localhost:3000/stages/stage-04` - stage detail page with scenario, demo users, expected findings, and lesson/report links.
- `http://localhost:3000/reports/stage-04` - generated report and comparison viewer.
- `http://localhost:3000/scoreboard` - PASS/PARTIAL/FAIL scorecard across stages.

If report files are missing, the dashboard shows the local command needed to generate them.

## Demo Scripts

Presenter-ready demo docs:

- [7-minute demo](docs/demo-7min.md)
- [15-minute demo](docs/demo-15min.md)
- [60-minute workshop](docs/workshop-60min.md)
- [Korean presenter notes](docs/presenter-notes-ko.md)

## Lesson Templates

Reusable lesson templates live here:

- `lessons/lesson-template-ko.md`
- `lessons/lesson-template-en.md`

Completed Korean lessons using the standard structure:

- `http://localhost:3000/stages/stage-01/lesson-ko` - Stage 01 exposed secrets
- `http://localhost:3000/stages/stage-04/lesson-ko` - Stage 04 IDOR and ownership checks
- `http://localhost:3000/stages/stage-07/lesson-ko` - Stage 07 unsafe file upload
- `http://localhost:3000/stages/stage-10/lesson-ko` - Stage 10 chained SaaS scenario
- `http://localhost:3000/stages/stage-11/lesson-ko` - Stage 11 fixed SaaS version

## Layout

```txt
bts-sec-staircase-lab/
apps/
  lab-dashboard/
  target-frontend/
  target-api/
  mock-llm/
expected/
infra/
  nginx/
  postgres/
  minio/
  redis/
lessons/
  en/
  ko/
reports/
  generated/
  snapshots/
  comparisons/
scripts/
stages/
```

## Stage Contract

Each stage directory contains:

- `README.md`
- `manifest.yaml`
- `expected-report.md`
- `lesson-ko.md`

Implemented stages must also have a matching expected findings file in `expected/`.

Schema references for future stage authoring:

- [Manifest schema](docs/manifest-schema.md)
- [Expected findings schema](docs/expected-findings-schema.md)
- [Stage 04 manifest example](docs/examples/stage-04-access-control.manifest.example.yaml)
- [Stage 04 expected findings example](docs/examples/stage-04-access-control.expected.example.yaml)

## Scaffold Report Workflow

```sh
pnpm scan -- --stage stage-00-clean
make compare STAGE=stage-00-clean
make score
make score-json
```

The scaffold workflow is deterministic and does not require the real BTS_sec binary. It writes generated reports under `reports/generated/<stage-id>/`.

Comparison outputs and scorecards are written to `reports/comparisons/`. Per-stage comparison files use deterministic names such as `reports/comparisons/stage-04.comparison.json` and `reports/comparisons/stage-04.comparison.md`.

## BTS_sec Runner

`make scan` runs the real BTS_sec binary against a selected local stage:

```sh
make scan STAGE=04
```

`STAGE` must be a known local stage number or stage ID from `stages/.stage-order`. It must not be a URL, external host, or arbitrary filesystem path.

This resolves to `stages/stage-04-access-control` and writes deterministic outputs:

- `reports/generated/stage-04.report.json`
- `reports/generated/stage-04.report.md`
- `reports/generated/stage-04.scan.log`

Run every known local stage:

```sh
make scan-all
```

Compare a generated report with the expected findings:

```sh
make compare STAGE=04
make score
make score-json
```

`make compare` checks matched and missed findings, unexpected findings, severity, category, file, route where available, evidence quality, required phrases, forbidden explanations, recommendation quality, and plain-language explanation checks. If no generated report exists yet, it prints the scan command to run first.

If `BTS_sec` is not on your `PATH`, set `BTS_SEC_BIN`:

```sh
BTS_SEC_BIN=/path/to/BTS_sec make scan STAGE=04
```

PowerShell:

```powershell
$env:BTS_SEC_BIN = "C:\path\to\BTS_sec.exe"
make scan STAGE=04
```

The default command shape is:

```sh
BTS_sec scan <stage-path> --json-out <json-report> --markdown-out <markdown-report>
```

If your local BTS_sec CLI uses different flags, override the argument template with `BTS_SEC_ARGS`:

```sh
BTS_SEC_ARGS="scan {stage_path} --json-out {json} --markdown-out {markdown}" make scan STAGE=04
```

Available placeholders are `{stage}`, `{stage_short}`, `{stage_path}`, `{json}`, `{markdown}`, and `{log}`. The runner only accepts known local stages from `stages/.stage-order`; it does not scan arbitrary external targets.

If `BTS_SEC_ARGS` contains a URL, it must be `localhost`, `127.0.0.1`, or `::1`. External domains and public IP literals fail before BTS_sec is launched.
