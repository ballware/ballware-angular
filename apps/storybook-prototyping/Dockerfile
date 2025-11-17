FROM node:20-bookworm-slim AS deps
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOADS=0 \
    YARN_ENABLE_SCRIPTS=false \
    NODE_ENV=development

RUN corepack enable

COPY .yarn/ .yarn/
COPY .yarnrc.yml package.json yarn.lock ./
RUN yarn install --immutable --mode=skip-build

FROM node:20-bookworm-slim AS build
ENV NODE_OPTIONS="--max-old-space-size=4096"
WORKDIR /app

RUN corepack enable

COPY --from=deps /app /app
COPY nx.json tsconfig.base.json decorate-angular-cli.js ./

RUN YARN_ENABLE_SCRIPTS=true yarn install --immutable --inline-builds

COPY apps/ apps/
COPY libs/ libs/

EXPOSE 4200
# EXPOSE 443

CMD ["yarn", "nx", "serve", "storybook-prototyping", "--no-open"]
