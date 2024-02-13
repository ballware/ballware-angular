FROM docker.io/nginx:stable-alpine

RUN apk update \
    && apk add jq \
    && rm -rf /var/cache/apk/*

COPY dist/webclient/* /usr/share/nginx/html/

COPY apps/webclient/nginx.conf /etc/nginx/nginx.conf
COPY apps/webclient/localhost.pem /etc/nginx/localhost.pem
COPY apps/webclient/localhost-key.pem /etc/nginx/localhost-key.pem

COPY apps/webclient/docker-entrypoint.sh /
RUN chmod a+rx /docker-entrypoint.sh
EXPOSE 80
EXPOSE 443

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
