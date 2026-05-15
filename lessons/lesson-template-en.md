# Stage XX: Stage Title

## 1. What You Learn In This Stage

Explain the security concept in plain language. Define any jargon the first time it appears.

## 2. Normal Feature Behavior

Describe the feature as a learner expects to use it. Examples: login, project detail, upload, AI generation, admin view.

## 3. What Is Vulnerable

Describe the intentionally vulnerable code or configuration. Focus on the unsafe trust decision rather than attack instructions.

## 4. Why It Is Risky

Explain the realistic impact, such as cross-user data exposure, stored content injection, or unauthorized admin access.

## 5. How To Check It Locally

Provide safe local-only demo steps. Do not use external sites, public IPs, real accounts, or real credentials.

```sh
pnpm scan -- --stage stage-XX-name
```

## 6. How To Scan With BTS_sec

Use the real BTS_sec command when installed. Use the deterministic scaffold report command when BTS_sec is not installed.

```sh
make scan STAGE=XX
pnpm compare -- --stage XX
```

## 7. Phrases To Look For In The Report

List phrases the report should include, plus phrases that would indicate a wrong explanation.

- Must include:
  - Core risk
  - Affected file or route
  - Safe fix direction
- Must not include:
  - A different vulnerability name

## 8. Fix Direction

Explain how to keep the feature while removing the vulnerability. Show vulnerable and safer patterns when useful.

## 9. Rescan After Fixing

Run the same scan and comparison after the fix. Confirm Critical and High findings are gone. Review Low/Info items for actionable improvements.

```sh
make scan STAGE=XX
pnpm compare -- --stage XX
```

## 10. Key Takeaways

Summarize what a beginner should remember in three points or fewer.

- Takeaway 1
- Takeaway 2
- Takeaway 3
