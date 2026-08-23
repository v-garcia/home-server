FROM kopia/kopia:0.23.1
# https://hub.docker.com/r/kopia/kopia/tags

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Repository config/cache/logs, per https://kopia.io/docs/installation/#docker-images
VOLUME ["/app/config", "/app/cache", "/app/logs", "/data"]

ENTRYPOINT ["/entrypoint.sh"]
CMD ["sh"]
