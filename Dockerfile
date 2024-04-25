# base node image
FROM node:21-alpine3.18 AS base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /localui

RUN corepack enable
ADD package.json ./
ADD yarn.lock ./
ADD .yarnrc.yml ./
ADD .yarn ./.yarn
RUN yarn install

# Setup production node_modules
FROM base AS production-deps

WORKDIR /localui

COPY --from=deps /localui/node_modules /localui/node_modules
RUN corepack enable
ADD package.json ./
ADD yarn.lock ./
ADD .yarnrc.yml ./
ADD .yarn ./.yarn
# Prune dev dependencies
RUN yarn workspaces focus --production

# Build the app
FROM base AS build

WORKDIR /localui

COPY --from=deps /localui/node_modules /localui/node_modules

ADD . .
RUN yarn build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /localui

COPY --from=production-deps /localui/node_modules /localui/node_modules

RUN corepack enable
COPY --from=build /localui/build/server /localui/build/server
COPY --from=build /localui/build/client /localui/build/client
COPY --from=build /localui/package.json /localui/package.json
COPY --from=build /localui/yarn.lock /localui/yarn.lock
COPY --from=build /localui/.yarnrc.yml /localui/.yarnrc.yml
COPY --from=build /localui/.yarn /localui/.yarn

ENTRYPOINT ["yarn", "start"]
