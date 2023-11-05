# base node image
FROM node:21-alpine3.18 AS base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /aws-ui

ADD package.json ./
RUN npm install --include=dev

# Setup production node_modules
FROM base AS production-deps

WORKDIR /aws-ui

COPY --from=deps /aws-ui/node_modules /aws-ui/node_modules
ADD package.json ./
RUN npm prune --omit=dev

# Build the app
FROM base AS build

WORKDIR /aws-ui

COPY --from=deps /aws-ui/node_modules /aws-ui/node_modules

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /aws-ui

COPY --from=production-deps /aws-ui/node_modules /aws-ui/node_modules

COPY --from=build /aws-ui/build /aws-ui/build
COPY --from=build /aws-ui/public /aws-ui/public
COPY --from=build /aws-ui/package.json /aws-ui/package.json

ENTRYPOINT ["npm", "start"]
