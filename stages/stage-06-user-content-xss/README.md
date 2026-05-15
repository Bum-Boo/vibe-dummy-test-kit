# Stage 06: Unsafe User Content and XSS Risk

This stage demonstrates unsafe rendering of user-controlled and AI-generated content. It is a local-only code fixture for BTS_sec scanner validation.

All demonstration strings are harmless formatting examples. Do not add real attack payloads.

## Intentional Findings

- `XSS-001`: user bio rendered with `dangerouslySetInnerHTML`.
- `XSS-002`: markdown renderer allows raw HTML without sanitization.
- `XSS-003`: admin inquiry page renders submitted message content as HTML.
- `XSS-004`: weak Content Security Policy allows unsafe inline behavior.

## Safe Contrast

- `XSS-005` should not be reported. `SafeUserBioText` and `SafeInquiryMessage` render user content as escaped JSX text.

## Manual Locations

- `src/vulnerable-user-bio.tsx`
- `src/vulnerable-markdown.tsx`
- `src/vulnerable-admin-inquiry.tsx`
- `src/security-headers.ts`
- `src/safe-user-content.tsx`

