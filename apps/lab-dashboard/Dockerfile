FROM node:22-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/lab-dashboard/package.json apps/lab-dashboard/package.json

RUN pnpm install --filter @bts-sec/lab-dashboard --frozen-lockfile=false

COPY apps/lab-dashboard apps/lab-dashboard

EXPOSE 3000

CMD ["pnpm", "--filter", "@bts-sec/lab-dashboard", "dev"]
