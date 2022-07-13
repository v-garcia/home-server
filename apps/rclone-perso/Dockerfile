FROM alpine:3.16.0 as build-rclone

WORKDIR /opt/

# Rclone version
ENV RCLONE_VERSION "v1.59.0"

# Quietly download rclone
RUN wget -q -O rclone.zip https://github.com/rclone/rclone/releases/download/$RCLONE_VERSION/rclone-$RCLONE_VERSION-linux-amd64.zip && \
      unzip -j rclone.zip *rclone && \
      chmod +x rclone

FROM python:3.11-rc-alpine3.16

COPY --from=build-rclone /opt/rclone /usr/bin

COPY run.py /run.py
RUN chmod +x /run.py

# Local folder to sync
VOLUME ["/sync/"]

ENTRYPOINT ["/run.py"]

# nb config file sought at https://rclone.org/docs/#config-config-file