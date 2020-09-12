FROM alpine:3.12.0 as build-rclone

WORKDIR /opt/

# Rclone version
ENV RCLONE_VERSION "v1.53.0"

# Quietly download rclone
RUN wget -q -O rclone.zip https://github.com/rclone/rclone/releases/download/$RCLONE_VERSION/rclone-$RCLONE_VERSION-linux-amd64.zip && \
      unzip -j rclone.zip *rclone && \
      chmod +x rclone

FROM alpine:3.12.0 as build-rclone-sync

WORKDIR /opt/
ENV RCLONE_SYNC_VERSION "V3.1"

RUN wget -q -O rclone-sync.zip https://github.com/cjnaz/rclonesync-V2/archive/$RCLONE_SYNC_VERSION.zip && \
      unzip -j rclone-sync.zip *rclonesync && \
      chmod +x rclonesync



FROM python:3.9-rc-alpine3.12

COPY --from=build-rclone-sync /opt/rclonesync /usr/bin
COPY --from=build-rclone /opt/rclone /usr/bin
# COPY --from=build-rclone /etc/ssl/certs /etc/ssl/certs

COPY run.py /run.py
RUN chmod +x /run.py

# Local folder to sync
VOLUME ["/sync/"]

ENTRYPOINT ["/run.py"]

# nb config file sought at https://rclone.org/docs/#config-config-file