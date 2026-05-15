# BTS_sec 7-Minute Demo Script

Audience: short product or engineering demo for people who have not used the lab before.

Goal: show one clear bug, run BTS_sec, compare the result, and show that the fixed stage is clean.

## Setup Before The Demo

Run these before the meeting if possible:

```sh
make setup
make up
make dashboard
```

Open:

- Dashboard: `http://localhost:3000`
- Stage 04 detail: `http://localhost:3000/stages/stage-04`
- Stage 04 report: `http://localhost:3000/reports/stage-04`
- Stage 11 report: `http://localhost:3000/reports/stage-11`

If `make dashboard` starts on another local port because `3000` is busy, use the port printed by Next.js.

## BTS_sec Fallback

If the BTS_sec binary is unavailable, `make scan STAGE=04` will print a helpful `BTS_SEC_BIN` error. For a deterministic local demo, use the scaffold report generator:

```sh
pnpm scan -- --stage stage-04-access-control
pnpm compare -- --stage 04
pnpm scan -- --stage stage-11-fixed
pnpm compare -- --stage 11
```

Say clearly: "This fallback simulates deterministic scanner output from the expected local fixtures. It does not scan external systems."

## Minute-By-Minute Run

### 0:00-0:45 Start The Lab

Show the repository and run:

```sh
make up
make dashboard
```

Talking point:

- "Everything runs locally. The vulnerable stages are not meant to be deployed."

### 0:45-1:30 Open Stage 04

Open `http://localhost:3000/stages/stage-04`.

Point at:

- Stage title: Broken access control and IDOR
- Demo users: Alice, Bob, Admin
- Expected findings: BAC-001, BAC-002, BAC-003

Talking point:

- "This is about object-level authorization. Login alone is not enough."

### 1:30-2:30 Show Alice/Bob Project Access Issue

Run:

```sh
pnpm exec tsx stages/stage-04-access-control/src/manual-demo.ts
```

Explain:

- Alice should only see Alice's project.
- The vulnerable route reads only the URL parameter ID.
- Changing the ID can return Bob's project in the local demo.

Do not describe this as SQL injection.

### 2:30-3:45 Run BTS_sec Scan

Run:

```sh
make scan STAGE=04
```

If BTS_sec is missing, use:

```sh
pnpm scan -- --stage stage-04-access-control
```

Talking point:

- "The scanner target is a known local stage path, not an arbitrary public URL."

### 3:45-4:45 Show The Report

Open `http://localhost:3000/reports/stage-04`.

Point at:

- Summary counts: 3 High
- Finding IDs: BAC-001, BAC-002, BAC-003
- Evidence: `findProjectById(id)`, `findOrderById(id)`, `deleteProjectById(id)`

Talking point:

- "Good evidence should name the route or file and explain the missing ownership check."

### 4:45-5:45 Run Comparison

Run:

```sh
make compare STAGE=04
```

Expected output:

```txt
BTS-Sec Benchmark Result: Stage 04
Matched findings: 3
False positives: 0
Missed findings: 0
Overall: PASS
```

Talking point:

- "The benchmark is not only about finding bugs. It checks whether the report says the right thing."

### 5:45-6:45 Show Stage 11 Fixed Result

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

Open `http://localhost:3000/reports/stage-11`.

Talking point:

- "Stage 11 keeps the SaaS workflow but removes the Critical and High issues. This validates false-positive control and fix verification."

### 6:45-7:00 Close

End with:

- "Stages isolate one class of mistake, then Stage 10 chains them into a realistic SaaS scenario."
- "Reports and comparisons are saved under `reports/` for repeatable demos."
