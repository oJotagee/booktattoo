# Build context = raiz do monorepo:
#   docker build -f docker/kong/Dockerfile -t bookink-kong .

FROM kong:3.9.1

ENV KONG_DATABASE=off
ENV KONG_DECLARATIVE_CONFIG=/tmp/kong.yml
ENV KONG_PROXY_LISTEN=0.0.0.0:8000
ENV KONG_ADMIN_LISTEN=off
ENV KONG_STATUS_LISTEN=0.0.0.0:8100
ENV KONG_DNS_ORDER=LAST,AAAA,A,CNAME
ENV KONG_PROXY_ACCESS_LOG=/dev/stdout
ENV KONG_PROXY_ERROR_LOG=/dev/stderr

COPY docker/kong/kong.yml /kong/kong.yml
COPY --chmod=755 docker/kong/entrypoint.sh /kong/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/kong/entrypoint.sh"]
CMD ["kong", "docker-start"]
