FROM docker.io/library/node:lts-alpine AS build_node_modules

# Update npm to latest
RUN npm install -g npm@latest

# Copy Web UI
COPY wireguard-ui /app
WORKDIR /app
RUN npm install
RUN npm run build
RUN npm prune --omit=dev

FROM docker.io/library/node:lts-alpine
COPY --from=build_node_modules /app /app

# Install Linux packages
RUN apk add --no-cache \
    iptables \
    wireguard-tools

# Set Environment
ENV NODE_ENV=production

# Run Web UI
WORKDIR /app
CMD ["npm", "run", "start"]
