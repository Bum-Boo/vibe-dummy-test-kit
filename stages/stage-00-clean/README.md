# Stage 00: Clean Baseline

Stage 00 is the false-positive control stage for BTS_sec. It is intentionally boring: the app has normal SaaS behavior, but no intentionally vulnerable behavior.

## What This Stage Includes

- Explicit login/session simulation with `?userId=alice`, `?userId=bob`, or `?userId=admin`.
- Current-user project list.
- Project detail endpoint.
- Server-side ownership checks before private project data is returned.
- Safe file upload validation stub that checks filename, MIME type, and size metadata.
- Public portfolio page that returns only public projects.
- Admin placeholder that requires the Admin demo session.
- Helmet security headers in the target API.
- Baseline local Nginx headers for reverse-proxy lessons.

## Run Locally

In one terminal:

```sh
pnpm --filter @bts-sec/target-api dev
```

In another terminal:

```sh
pnpm --filter @bts-sec/target-frontend dev
```

Open:

- `http://localhost:3001`
- `http://localhost:3001/projects?userId=alice`
- `http://localhost:3001/projects/proj-alice-001?userId=alice`
- `http://localhost:3001/portfolio/alice-product-design`
- `http://localhost:3001/admin?userId=admin`

## Safety Notes

There are no fake vulnerabilities in this stage. If BTS_sec reports critical or high findings here, treat that as a false-positive or harness issue until proven otherwise.

