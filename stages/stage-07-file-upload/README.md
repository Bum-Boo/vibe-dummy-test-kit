# Stage 07: Unsafe File Upload

This stage demonstrates unsafe backend and storage patterns for user uploads. It is local-only and uses harmless sample files.

## Vulnerable Route

`uploadAvatarVulnerable` in `src/vulnerable-upload-route.ts` intentionally:

- uses the original uploaded filename
- writes to `./public/uploads`
- validates only by file extension
- does not validate MIME type
- does not enforce a file size limit
- allows `.svg` without sanitization
- returns a public URL immediately

## Safe Contrast

`uploadAvatarSafely` in `src/safe-upload-route.ts`:

- generates a random server-side filename
- enforces a size limit
- uses a MIME allowlist
- uses an extension allowlist
- writes outside the public web root at `./storage/private/uploads`
- returns an object key instead of an immediate public URL

In a fuller local app this private path can be replaced by MinIO object storage with controlled access and signed download routes.

## Manual Demo

Run:

```bash
pnpm exec tsx stages/stage-07-file-upload/src/manual-demo.ts
```

The vulnerable demo writes a harmless SVG to `stages/stage-07-file-upload/public/uploads`. The safe demo writes a harmless placeholder file under `stages/stage-07-file-upload/storage/private/uploads`.

Clear generated upload files with:

```bash
make reset-uploads
```

or, without `make`:

```bash
pnpm exec tsx scripts/reset-uploads.ts
```

