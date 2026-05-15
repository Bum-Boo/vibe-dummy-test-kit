FROM node:22-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/target-api/package.json apps/target-api/package.json

RUN pnpm install --filter @bts-sec/target-api --frozen-lockfile=false

COPY apps/target-api apps/target-api

EXPOSE 4000

CMD ["pnpm", "--filter", "@bts-sec/target-api", "dev"]
