FROM node:22-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/target-frontend/package.json apps/target-frontend/package.json

RUN pnpm install --filter @bts-sec/target-frontend --frozen-lockfile=false

COPY apps/target-frontend apps/target-frontend

EXPOSE 3001

CMD ["pnpm", "--filter", "@bts-sec/target-frontend", "dev"]

