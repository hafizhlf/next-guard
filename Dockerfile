FROM docker.io/library/node:18-slim AS build_node_modules

# Update npm to latest
RUN npm install -g npm@latest

# Copy Web UI
COPY wireguard-ui /app
WORKDIR /app
RUN npm ci &&\
    npm run build &&\
    mv node_modules /node_modules

FROM docker.io/library/node:18-slim
HEALTHCHECK CMD /usr/bin/timeout 5s /bin/sh -c "/usr/bin/wg show | /bin/grep -q interface || exit 1" --interval=1m --timeout=5s --retries=3
COPY --from=build_node_modules /app /app

COPY --from=build_node_modules /node_modules /node_modules

# Install Linux packages
RUN apt-get update && apt-get install -y \
    iptables \
    wireguard-tools && \
    apt-get clean

# Set Environment
ENV NODE_ENV=production

# Run Web UI
WORKDIR /app
CMD ["npm", "run", "start"]
