# Expected Report: Stage 02 Frontend Config Mistakes

BTS_sec should identify that privileged-looking values are exposed through frontend configuration conventions.

| ID | Expected finding | Severity |
| --- | --- | --- |
| CONFIG-001 | Sensitive value exposed through `NEXT_PUBLIC_` variable | High |
| CONFIG-002 | Internal admin URL exposed in client config | Medium |
| CONFIG-003 | Debug token exposed through frontend config | High |

Required report language:

- `NEXT_PUBLIC_`, `VITE_`, and `REACT_APP_` values can become browser-visible.
- Privileged keys, admin URLs, and debug tokens should stay server-side.
- Browser code should call backend routes that perform privileged actions instead of receiving privileged config directly.
- All values in this stage are fake training values.

