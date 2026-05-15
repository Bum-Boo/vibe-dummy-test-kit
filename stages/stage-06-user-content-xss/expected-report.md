# Expected Report: Stage 06 Unsafe User Content and XSS Risk

BTS_sec should report unsafe HTML rendering sinks and weak browser-side defense configuration. The report should explain that user-controlled or AI-generated content is being rendered as HTML without sanitization.

| ID | Finding | Severity | Evidence | Plain-Language Risk | Safe Fix |
| --- | --- | --- | --- | --- | --- |
| XSS-001 | User-controlled bio rendered via `dangerouslySetInnerHTML` | High | `dangerouslySetInnerHTML={{ __html: user.bio }}` | A saved profile bio can become HTML in another user's browser. | Render as text or sanitize with a reviewed sanitizer before HTML rendering. |
| XSS-002 | Markdown raw HTML rendered without sanitization | High | `allowRawHtml: true`, `sanitize: false` | Markdown content can carry raw HTML into the page. | Disable raw HTML or sanitize the rendered HTML output. |
| XSS-003 | Admin inquiry content rendered as HTML | High | `dangerouslySetInnerHTML={{ __html: inquiry.messageHtml }}` | Admin pages often have privileged users, so unsafe submitted content is a high-risk sink. | Render messages as text or sanitize before display. |
| XSS-004 | Missing or weak CSP | Medium | `default-src * 'unsafe-inline' 'unsafe-eval'` | CSP is too broad to meaningfully limit script execution if unsafe HTML slips through. | Use a strict CSP without broad wildcards, inline script, or eval allowances. |

## Negative Assertion

`XSS-005` should not be reported. `SafeUserBioText` and `SafeInquiryMessage` render user content as JSX text, which React escapes by default.

## Required Report Language

The report should mention:

- text rendering versus HTML rendering
- user-controlled content
- sanitization
- stored XSS risk
- CSP as defense in depth, not a replacement for sanitization

## Expected Summary

- Critical: 0
- High: 3
- Medium: 1
- Low: 0
- Info: 0

