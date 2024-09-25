FROM alpine:3.20.2 as build-rclone

WORKDIR /opt/

# Rclone version
ENV RCLONE_VERSION "v1.67.0"

# Quietly download rclone
RUN wget -q -O rclone.zip https://github.com/rclone/rclone/releases/download/$RCLONE_VERSION/rclone-$RCLONE_VERSION-linux-amd64.zip && \
      unzip -j rclone.zip *rclone && \
      chmod +x rclone

FROM python:3.12.5-alpine3.20

COPY --from=build-rclone /opt/rclone /usr/bin

COPY run.py /run.py
RUN chmod +x /run.py

# Local folder to sync
VOLUME ["/sync/"]

ENTRYPOINT ["/run.py"]

# nb config file sought at https://rclone.org/docs/#config-config-file