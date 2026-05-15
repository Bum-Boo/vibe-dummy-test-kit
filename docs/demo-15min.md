# BTS_sec 15-Minute Demo Script

Audience: engineering team, security champion group, or scanner evaluation call.

Goal: show several vulnerability classes, demonstrate expected-vs-actual comparison, then show the fixed stage.

## Setup Before The Demo

```sh
make setup
make up
make dashboard
```

Open:

- Dashboard: `http://localhost:3000`
- Stages: `http://localhost:3000/stages`
- Scoreboard: `http://localhost:3000/scoreboard`

## BTS_sec Fallback

If `make scan STAGE=<id>` fails because BTS_sec is unavailable, generate deterministic local scaffold reports:

```sh
pnpm scan -- --stage stage-01-secrets
pnpm scan -- --stage stage-04-access-control
pnpm scan -- --stage stage-07-file-upload
pnpm scan -- --stage stage-10-chained-saas
pnpm scan -- --stage stage-11-fixed
```

Then run comparisons with the same Makefile-compatible stage numbers:

```sh
make compare STAGE=01
make compare STAGE=04
make compare STAGE=07
make compare STAGE=10
make compare STAGE=11
```

If `make` is not installed on the presenter machine, use:

```sh
pnpm compare -- --stage 01
```

## Run Of Show

### 0:00-1:30 Intro And Safety Boundary

Show `http://localhost:3000`.

Say:

- "This is local-only. We do not scan external systems from this lab."
- "All secrets and users are fake deterministic demo data."
- "Each stage has expected findings, a lesson, a generated report, and comparison output."

### 1:30-4:00 Stage 01: Exposed Secrets

Open `http://localhost:3000/stages/stage-01`.

Show local evidence:

```sh
rg "fake_.*for_training_only" stages/stage-01-secrets
```

Run:

```sh
make scan STAGE=01
make compare STAGE=01
```

Fallback:

```sh
pnpm scan -- --stage stage-01-secrets
pnpm compare -- --stage 01
```

Open `http://localhost:3000/reports/stage-01`.

Talking points:

- Frontend code and built JavaScript are visible to users.
- `NEXT_PUBLIC_` is for values that may be exposed to browsers.
- Real exposed keys must be rotated, not only deleted from git.

### 4:00-6:30 Stage 04: IDOR

Open `http://localhost:3000/stages/stage-04`.

Run the manual demo:

```sh
pnpm exec tsx stages/stage-04-access-control/src/manual-demo.ts
```

Run:

```sh
make scan STAGE=04
make compare STAGE=04
```

Fallback:

```sh
pnpm scan -- --stage stage-04-access-control
pnpm compare -- --stage 04
```

Open `http://localhost:3000/reports/stage-04`.

Talking points:

- The route parameter ID is not enough.
- The fix is an ownership check such as `ownerId: session.user.id`.
- This is object-level authorization, not SQL injection.

### 6:30-9:00 Stage 07: Unsafe File Upload

Open `http://localhost:3000/stages/stage-07`.

Show local evidence:

```sh
rg "file.name|public/uploads|allowedMimeTypes|randomUUID" stages/stage-07-file-upload
```

Run:

```sh
make scan STAGE=07
make compare STAGE=07
```

Fallback:

```sh
pnpm scan -- --stage stage-07-file-upload
pnpm compare -- --stage 07
```

Open `http://localhost:3000/reports/stage-07`.

Talking points:

- Original filenames are user input.
- Public upload directories expose files immediately.
- Safer handling uses size limits, MIME allowlists, extension allowlists, random server filenames, and private storage.

### 9:00-12:30 Stage 10: Chained SaaS

Open `http://localhost:3000/stages/stage-10`.

Run:

```sh
make scan STAGE=10
make compare STAGE=10
```

Fallback:

```sh
pnpm scan -- --stage stage-10-chained-saas
pnpm compare -- --stage 10
```

Open `http://localhost:3000/reports/stage-10`.

Talking points:

- Stage 10 combines frontend secrets, IDOR, unsafe AI HTML, unsafe upload, frontend-only admin protection, permissive CORS, and excessive data exposure.
- The executive summary should explain the combined attack chain in plain language.
- Overall risk should be Critical because the issues reinforce one another.

### 12:30-14:15 Stage 11: Fixed Version

Open `http://localhost:3000/stages/stage-11`.

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

Open `http://localhost:3000/scoreboard`.

Talking points:

- The fixed stage keeps functionality.
- Critical and High findings should be zero.
- The scorecard is useful for scanner regression demos.

### 14:15-15:00 Close

Say:

- "The lab teaches beginners and validates scanner behavior at the same time."
- "The compare step checks IDs, severity, evidence, and report language."
- "The next useful exercise is to add a new stage with a manifest, expected findings, and lesson."
