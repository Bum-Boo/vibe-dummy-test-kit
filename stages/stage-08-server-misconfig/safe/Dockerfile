FROM node:22-alpine

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY package.json /app/package.json

USER app

CMD ["node", "server.js"]

