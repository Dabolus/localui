# base node image
FROM oven/bun:1.1-alpine AS base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /localui

ADD package.json ./
ADD bun.lockb ./
RUN bun install

# Setup production node_modules
FROM base AS production-deps

WORKDIR /localui

COPY --from=deps /localui/node_modules /localui/node_modules
ADD package.json ./
ADD bun.lockb ./
# Prune dev dependencies
# Note: Bun doesn't support a command to directly prune dev dependencies yet
# See: https://github.com/oven-sh/bun/issues/3605
RUN rm -rf node_modules && bun install --production

# Build the app
FROM base AS build

WORKDIR /localui

COPY --from=deps /localui/node_modules /localui/node_modules

ADD . .
RUN bun run build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /localui

COPY --from=production-deps /localui/node_modules /localui/node_modules

COPY --from=build /localui/build/server /localui/build/server
COPY --from=build /localui/build/client /localui/build/client
COPY --from=build /localui/package.json /localui/package.json
COPY --from=build /localui/bun.lockb /localui/bun.lockb

ENTRYPOINT ["bun", "start"]
