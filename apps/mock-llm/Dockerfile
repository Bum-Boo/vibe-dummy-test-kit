FROM node:22-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/mock-llm/package.json apps/mock-llm/package.json

RUN pnpm install --filter @bts-sec/mock-llm --frozen-lockfile=false

COPY apps/mock-llm apps/mock-llm

EXPOSE 4100

CMD ["pnpm", "--filter", "@bts-sec/mock-llm", "dev"]

