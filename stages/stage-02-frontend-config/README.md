# Stage 02: Frontend Config Mistakes

This stage focuses on configuration that becomes visible in browser code. It is not primarily about raw secret regex matching; it is about understanding framework conventions that intentionally expose variables to the client bundle.

All values are fake local training values.

## Intentional Findings

- `CONFIG-001`: sensitive value exposed through `NEXT_PUBLIC_`.
- `CONFIG-002`: internal admin URL exposed in client config.
- `CONFIG-003`: debug/admin token exposed through frontend config prefixes.

## Manual Locations

- `.env.example`: public env vars with privileged-looking names.
- `src/client-config.ts`: client-side config object using `NEXT_PUBLIC_`, `VITE_`, and `REACT_APP_` values.
- `src/runtime-config.ts`: browser-visible runtime config with an internal admin URL.
- `dist/static/config.js`: built static config artifact.

## Safety

These values are fake. Do not add real admin keys, debug tokens, service URLs, or credentials to this stage.

