FROM docker.io/library/node:lts-bookworm AS build_node_modules

COPY /app /app
WORKDIR /app
RUN npm install
RUN npm run build
RUN npm prune --omit=dev

FROM docker.io/library/node:lts-bookworm
COPY --from=build_node_modules /app /app

RUN apt update \
    && apt install wireguard-tools iproute2 iptables -y \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

WORKDIR /app
CMD ["npm", "run", "start"]
