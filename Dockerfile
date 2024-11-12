# As a workaround we have to build on nodejs 18
# nodejs 20 hangs on build with armv6/armv7
FROM docker.io/library/node:lts-alpine AS build_node_modules

# Update npm to latest
RUN npm install -g npm@latest

# Copy Web UI
COPY wireguard-ui /app
WORKDIR /app
RUN npm ci &&\
    npm run build &&\
    mv node_modules /node_modules

# Copy build result to a new image.
# This saves a lot of disk space.
FROM docker.io/library/node:lts-alpine
HEALTHCHECK CMD /usr/bin/timeout 5s /bin/sh -c "/usr/bin/wg show | /bin/grep -q interface || exit 1" --interval=1m --timeout=5s --retries=3
COPY --from=build_node_modules /app /app

COPY --from=build_node_modules /node_modules /node_modules

# Install Linux packages
RUN apk add --no-cache \
    dpkg \
    dumb-init \
    iptables \
    iptables-legacy \
    wireguard-tools

# Use iptables-legacy
RUN update-alternatives --install /sbin/iptables iptables /sbin/iptables-legacy 10 --slave /sbin/iptables-restore iptables-restore /sbin/iptables-legacy-restore --slave /sbin/iptables-save iptables-save /sbin/iptables-legacy-save

# Set Environment
ENV NODE_ENV=production

# Run Web UI
WORKDIR /app
CMD ["npm", "run", "start"]