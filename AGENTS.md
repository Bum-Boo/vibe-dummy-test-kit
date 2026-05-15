# AGENTS.md

This file defines the working rules for future Codex tasks in `bts-sec-staircase-lab`.

## Repository Purpose

`bts-sec-staircase-lab` is a local-only educational vulnerable application lab and benchmark harness for BTS_sec.

The repository has four goals:

1. Build a staged vulnerable full-stack lab.
2. Provide a deterministic benchmark harness for BTS_sec.
3. Teach beginner-friendly security lessons.
4. Maintain expected report manifests for scanner validation.

## Safety Rules

- Keep all vulnerable behavior local-only and educational.
- Never add public deployment instructions for vulnerable stages.
- Never add real secrets, real tokens, real API keys, production credentials, or live cloud credentials.
- Use fake local test values only, and label them clearly as fake.
- Never add features, tests, scripts, prompts, or scanner tooling that attack external systems.
- Scanner wrappers must use repository-defined localhost targets only.
- Do not add cloud integrations, public hostnames, or arbitrary target inputs.
- Vulnerable code must be clearly labeled as intentionally vulnerable.
- Fixed stages must preserve the demo functionality while removing the vulnerability.

## Preferred Stack And Conventions

- Prefer TypeScript.
- Prefer pnpm workspace conventions.
- Keep route handlers small and readable.
- Keep React/Next.js components simple and focused.
- Use clear file and directory names.
- Avoid overengineering and unnecessary abstractions.
- Add comments only where they help beginners understand the security issue or the fix.
- Make demo users, IDs, timestamps, fixtures, seeds, and scanner outputs deterministic.
- Do not silently change project scope. Explain tradeoffs when scope changes are necessary.

## Repository Layout

Expected top-level layout:

- `apps/lab-dashboard/`: Next.js dashboard for lab navigation and scanner workflow.
- `apps/target-frontend/`: Next.js target app shell for vulnerable stages.
- `apps/target-api/`: Express or simple Node.js API for stage behavior.
- `apps/mock-llm/`: deterministic local mock LLM service for AI-risk lessons.
- `scripts/`: scan, compare, score, and benchmark helpers.
- `expected/`: expected BTS_sec finding manifests.
- `stages/`: one directory per staircase stage.
- `reports/generated/`: generated BTS_sec reports.
- `reports/snapshots/`: optional golden snapshots when explicitly requested.
- `reports/comparisons/`: generated comparison outputs.
- `infra/`: local Docker Compose service configuration such as Postgres, Redis, MinIO, and Nginx.

Generated files should stay out of commits unless a task explicitly asks for committed golden fixtures.

## Stage Contract

Every stage must be deterministic and beginner-friendly.

Every stage directory must include:

- `README.md`: stage purpose, local usage, and safety notes.
- `manifest.yaml`: stage metadata, local target routes, services, and scanner scope.
- `expected-report.md`: human-readable expected scanner outcome.
- `lesson-ko.md`: Korean beginner explanation of the vulnerability and lesson.

Every implemented stage must also have a matching expected findings file used by the comparison harness. Prefer YAML for expected findings so BTS_sec checks can compare stable IDs, categories, severity, and explanations.

When adding or updating a stage:

- Keep the stage focused on one main security mistake unless it is an explicit combination stage.
- Document why the vulnerable behavior is intentionally present.
- Include deterministic seed data and demo users.
- Keep exploit demonstrations local and harmless.
- Update stage manifests, lessons, expected reports, and scanner expectations together.

## Reporting Rules

- Save all generated scanner reports under `reports/generated/`.
- Save all comparison outputs under `reports/comparisons/`.
- Do not commit routine generated scanner output.
- Expected report files and expected findings are source files and should be committed.
- Use stable finding IDs so report comparisons are reproducible.

## Commands

Use the Makefile entrypoints when available:

- `make setup`: install workspace dependencies.
- `make up`: start the local Docker Compose infrastructure stack.
- `make down`: stop the local Docker Compose infrastructure stack.
- `make reset`: reset local lab state.
- `make logs`: tail local Docker Compose logs.
- `make ps`: show local Docker Compose service status.
- `make scan STAGE=<stage-id>`: run BTS_sec or the local scaffold scanner for one stage.
- `make compare STAGE=<stage-id>`: compare generated results against expected findings.
- `make score`: summarize benchmark status.

Equivalent pnpm commands may be used when `make` is unavailable in the current shell.

The local BTS_sec toolkit may be available at `C:\Users\Hojun\Desktop\Bumboo\Codes\Sec kit`; inspect it only when a task specifically needs to run or integrate `bts_sec`.

## Validation Before Finishing

Before finishing any implementation task:

1. Run type checks if available.
2. Run tests if available.
3. Run lint if available.
4. Confirm the relevant Makefile commands still work, or state clearly if `make` is unavailable.
5. Confirm scanner outputs write to `reports/generated/`.
6. Confirm comparison outputs write to `reports/comparisons/`.
7. Summarize changed files and remaining risks.

If a validation command cannot run because a local dependency is missing, report that explicitly and include the closest command that did run.

## Done Criteria For Future Tasks

A future Codex task is not done until:

- The requested behavior is implemented or the blocker is clearly explained.
- Safety rules remain intact.
- Stage documentation and expected findings are updated when stage behavior changes.
- Generated artifacts are kept in the correct reports directories.
- Validation results are summarized in the final response.
