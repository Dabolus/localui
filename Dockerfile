# base node image
FROM node:21-alpine3.18 AS base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /localui

ADD package.json ./
RUN npm install --include=dev

# Setup production node_modules
FROM base AS production-deps

WORKDIR /localui

COPY --from=deps /localui/node_modules /localui/node_modules
ADD package.json ./
RUN npm prune --omit=dev

# Build the app
FROM base AS build

WORKDIR /localui

COPY --from=deps /localui/node_modules /localui/node_modules

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /localui

COPY --from=production-deps /localui/node_modules /localui/node_modules

COPY --from=build /localui/build /localui/build
COPY --from=build /localui/public /localui/public
COPY --from=build /localui/package.json /localui/package.json

ENTRYPOINT ["npm", "start"]
