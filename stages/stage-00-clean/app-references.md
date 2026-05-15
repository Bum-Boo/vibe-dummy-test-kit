# Stage 00 App References

Stage 00 runs against the safe baseline target app:

- API seed data and security helpers: `apps/target-api/src/demoData.ts`
- Demo session helper: `apps/target-api/src/session.ts`
- API routes and ownership checks: `apps/target-api/src/index.ts`
- Frontend demo user chooser: `apps/target-frontend/src/app/page.tsx`
- Frontend project list: `apps/target-frontend/src/app/projects/page.tsx`
- Frontend project detail: `apps/target-frontend/src/app/projects/[id]/page.tsx`
- Public portfolio page: `apps/target-frontend/src/app/portfolio/[slug]/page.tsx`
- Admin placeholder page: `apps/target-frontend/src/app/admin/page.tsx`

Run with:

```sh
pnpm --filter @bts-sec/target-api dev
pnpm --filter @bts-sec/target-frontend dev
```

