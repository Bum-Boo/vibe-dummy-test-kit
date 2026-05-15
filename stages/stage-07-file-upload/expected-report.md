# Expected Report: Stage 07 Unsafe File Upload

BTS_sec should report unsafe file upload handling in the vulnerable route and should not flag the safe contrast handler.

| ID | Finding | Severity | Evidence | Plain-Language Risk | Safe Fix |
| --- | --- | --- | --- | --- | --- |
| FILE-001 | Original filename used for uploaded file | High | `const filename = file.name;` | A client controls the stored name, which can create collisions or path handling mistakes. | Generate a server-side random filename and store the original name only as metadata. |
| FILE-002 | Upload saved under publicly served directory | High | ``./public/uploads/${filename}`` | Uploaded content becomes directly browser-accessible as soon as it is written. | Store outside the web root or in MinIO with controlled access. |
| FILE-003 | Missing file size limit | Medium | `no file size limit` | Large uploads can exhaust disk, memory, or request handling capacity. | Reject files above a small documented limit before writing. |
| FILE-004 | Missing MIME validation | Medium | `no MIME type validation` | Extension-only checks can be misleading because names are client-controlled. | Validate MIME type and extension, and inspect file content where appropriate. |
| FILE-005 | SVG allowed without sanitization | High | `".svg"` and `no SVG sanitization` | SVG is active content in browsers and needs special handling. | Disallow SVG or sanitize it with a dedicated sanitizer before serving. |

## Negative Assertion

`FILE-006` should not be reported. `uploadAvatarSafely` uses `randomUUID`, `maxUploadBytes`, `allowedMimeTypes`, `allowedExtensions`, and `./storage/private/uploads`.

## Expected Summary

- Critical: 0
- High: 3
- Medium: 2
- Low: 0
- Info: 0

