# BTS_sec 60-Minute Workshop Plan

Audience: developers, vibe coders, security champions, or scanner evaluators.

Goal: teach how to inspect a vulnerable stage manually, run BTS_sec, read the report, discuss fixes, and re-scan.

## Workshop Outcomes

Participants should leave able to:

- Explain why the lab is local-only.
- Navigate stage manifests, expected findings, lessons, generated reports, and comparisons.
- Run BTS_sec or the local scaffold fallback.
- Read report evidence and fix guidance.
- Describe safe fixes without removing the core app feature.

## Required Local Setup

Run:

```sh
make setup
make up
make dashboard
```

Open:

- Dashboard: `http://localhost:3000`
- Stages: `http://localhost:3000/stages`
- Scoreboard: `http://localhost:3000/scoreboard`

Confirm:

```sh
make ps
pnpm typecheck
```

If Docker is unavailable, the code-scannable stage exercises still work with:

```sh
pnpm install
pnpm dashboard
```

## BTS_sec Fallback

Primary scan path:

```sh
make scan STAGE=04
make compare STAGE=04
```

If BTS_sec is unavailable, use the deterministic scaffold generator:

```sh
pnpm scan -- --stage stage-04-access-control
pnpm compare -- --stage 04
```

Explain:

- `make scan` calls BTS_sec through `scripts/run-scan.ts`.
- `pnpm scan -- --stage ...` writes deterministic scaffold reports from local expected fixtures.
- Neither path should scan public domains or arbitrary public IPs.

## Agenda

### 0:00-5:00 Welcome And Safety Rules

Show `README.md` safety rules and dashboard home.

Key messages:

- Local-only lab.
- Fake secrets only.
- No public deployment.
- No external scanning.

Quick command:

```sh
make dashboard
```

### 5:00-12:00 Repository Tour

Open the stage list and show these folders:

```txt
stages/
expected/
reports/generated/
reports/comparisons/
lessons/
docs/
```

Show a stage contract:

```txt
stages/stage-04-access-control/
  README.md
  manifest.yaml
  expected-report.md
  lesson-ko.md
```

Discussion:

- `manifest.yaml` tells learners and tools what the stage is.
- `expected/*.expected.yaml` is scanner ground truth.
- `reports/generated` stores scanner output.
- `reports/comparisons` stores expected-vs-actual comparison output.

### 12:00-22:00 Manual Exploration: Stage 04

Open `http://localhost:3000/stages/stage-04`.

Run:

```sh
pnpm exec tsx stages/stage-04-access-control/src/manual-demo.ts
```

Ask participants:

- What is Alice allowed to see?
- What changes when the project ID is changed?
- Is the bug authentication or authorization?
- Which route is safe and why?

Expected conclusion:

- The vulnerable routes query by ID only.
- The safe route constrains by current user ID.

### 22:00-32:00 BTS_sec Scan And Comparison

Primary path:

```sh
make scan STAGE=04
make compare STAGE=04
```

Fallback path:

```sh
pnpm scan -- --stage stage-04-access-control
pnpm compare -- --stage 04
```

Open:

- `http://localhost:3000/reports/stage-04`
- `reports/generated/stage-04.report.json` if real BTS_sec was used
- `reports/generated/stage-04-access-control/bts-sec-report.json` if scaffold fallback was used
- `reports/comparisons/stage-04.comparison.json`

Reading exercise:

- Find BAC-001, BAC-002, BAC-003.
- Check severity.
- Check evidence.
- Check whether the report mentions object-level authorization and ownership check.
- Confirm it does not call the issue SQL injection.

### 32:00-42:00 Report Reading Across Multiple Stages

Split the group into small teams or walk through together.

Suggested stages:

```sh
make scan STAGE=01
make compare STAGE=01
make scan STAGE=07
make compare STAGE=07
make scan STAGE=10
make compare STAGE=10
```

Fallback:

```sh
pnpm scan -- --stage stage-01-secrets
pnpm scan -- --stage stage-07-file-upload
pnpm scan -- --stage stage-10-chained-saas
pnpm compare -- --stage 01
pnpm compare -- --stage 07
pnpm compare -- --stage 10
```

Prompts:

- Stage 01: Which values are browser-visible?
- Stage 07: What makes upload validation safer?
- Stage 10: Which issues combine into the executive risk summary?

### 42:00-52:00 Fix Discussion

Do not implement fixes during the first workshop unless the group is already comfortable with the codebase. Use the stage lessons and expected reports.

Discuss safe fixes:

- Secrets: move privileged values to server-only env vars and rotate real exposed keys.
- IDOR: query by object ID plus `ownerId`, `userId`, or `orgId`.
- Upload: random server filename, size limit, MIME allowlist, extension allowlist, private storage.
- AI output: treat AI output as untrusted, render as escaped text or sanitize.
- Admin: check role server-side.
- API exposure: return a DTO with only public fields.

Open:

- `http://localhost:3000/stages/stage-01/lesson-ko`
- `http://localhost:3000/stages/stage-04/lesson-ko`
- `http://localhost:3000/stages/stage-07/lesson-ko`
- `http://localhost:3000/stages/stage-10/lesson-ko`

### 52:00-58:00 Re-Scan Fixed Stage

Run:

```sh
make scan STAGE=11
make compare STAGE=11
make score
```

Fallback:

```sh
pnpm scan -- --stage stage-11-fixed
pnpm compare -- --stage 11
pnpm score
```

Open:

- `http://localhost:3000/reports/stage-11`
- `http://localhost:3000/scoreboard`

Expected conclusion:

- Stage 11 preserves the workflow.
- Critical and High findings should be zero.
- Low/Info items are acceptable only when actionable.

### 58:00-60:00 Wrap-Up

Close with:

- "Manual exploration teaches the bug."
- "BTS_sec provides repeatable detection."
- "Comparison checks whether the report matches expected ground truth."
- "The fixed stage proves the scanner can verify remediation and avoid noisy Critical/High false positives."

## Optional Follow-Up Exercise

Ask participants to draft a new stage:

1. Create `stages/stage-XX-name`.
2. Add `README.md`, `manifest.yaml`, `expected-report.md`, `lesson-ko.md`.
3. Add `expected/stage-XX.expected.yaml`.
4. Run:

```sh
pnpm scan -- --stage stage-XX-name
pnpm compare -- --stage XX
```
