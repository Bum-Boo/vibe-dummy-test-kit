FROM node:22-alpine

WORKDIR /app

# Stage 08 intentionally vulnerable: container runs as root.
USER root

# Stage 08 intentionally vulnerable: .env is copied into the image context.
COPY .env /app/.env
COPY package.json /app/package.json

CMD ["node", "server.js"]

