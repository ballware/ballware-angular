FROM docker.io/nginx:stable-alpine AS base

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
WORKDIR /app

RUN corepack enable

COPY --from=deps /app /app
COPY . .

RUN YARN_ENABLE_SCRIPTS=true yarn install --immutable --inline-builds
RUN yarn build

FROM base AS final

RUN apk update \
    && apk upgrade \
    && apk add jq \
    && rm -rf /var/cache/apk/*

COPY --from=build /app/dist/webclient* /var/www

COPY --from=build /app/apps/webclient/nginx.conf /etc/nginx/nginx.conf
# COPY apps/webclient/localhost.pem /etc/nginx/localhost.pem
# COPY apps/webclient/localhost-key.pem /etc/nginx/localhost-key.pem

COPY --from=build /app/apps/webclient/docker-entrypoint.sh /
RUN chmod a+rx /docker-entrypoint.sh
EXPOSE 80
# EXPOSE 443

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
