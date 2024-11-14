FROM docker.io/library/node:lts-alpine AS build_node_modules

COPY /app /app
WORKDIR /app
RUN npm install
RUN npm run build
RUN npm prune --omit=dev

FROM docker.io/library/node:lts-alpine
COPY --from=build_node_modules /app /app

RUN apk add --no-cache \
    iptables \
    wireguard-tools

ENV NODE_ENV=production

WORKDIR /app
CMD ["npm", "run", "start"]
