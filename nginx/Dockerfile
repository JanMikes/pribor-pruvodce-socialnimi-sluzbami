FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /var/www/uploads

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1
# 2026-11-25: trigger-only commit for a security rebuild (nginx:alpine 1.31.10, Alpine 3.24.4); no functional change.
