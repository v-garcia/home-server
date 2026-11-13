FROM alpine:3.23.5

# Sidecar of rqbit: push an apprise notification when a torrent is finished

COPY notify-on-finish.sh /usr/bin/notify-on-finish

RUN apk add --no-cache bash curl jq && \
    chmod +x /usr/bin/notify-on-finish

CMD ["/usr/bin/notify-on-finish"]
