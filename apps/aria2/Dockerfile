FROM alpine:3.11.5

ARG ARIA_NG_VERSION=1.1.4

COPY /root /


COPY /scripts/on-dl-finish.sh /usr/bin/on-dl-finish
COPY /scripts/watch-torrents.sh /usr/bin/watch-torrents
COPY /scripts/health-check.sh /usr/bin/health-check

RUN apk add --no-cache  bash \
                        aria2 \
                        nginx \
                        inotify-tools \
                        coreutils \
                        curl && \
    cd /aria2-ng && \
    curl -o archive.zip -L https://github.com/mayswind/AriaNg/releases/download/${ARIA_NG_VERSION}/AriaNg-${ARIA_NG_VERSION}.zip && \
    unzip archive.zip && \
    rm archive.zip && \
	sed -i.back 's~<head[^>]*>~&<script type="text/javascript" src="js/set-defaults.js"></script>~' index.html && \
    chmod +x /app/start.sh /usr/bin/on-dl-finish /usr/bin/watch-torrents /usr/bin/health-check && \
    rm -rf /var/cache/apk/*


CMD ["/app/start.sh"]