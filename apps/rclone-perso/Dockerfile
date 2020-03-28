FROM alpine:3.11.5 as build-rclone

# Rclone version
ENV RCLONE_VERSION "1.51.0"

# Quietly download rclone
RUN wget -q -O rclone.zip https://github.com/rclone/rclone/releases/download/v$RCLONE_VERSION/rclone-v$RCLONE_VERSION-linux-amd64.zip

# Unzip without folder structure
RUN unzip -j rclone.zip *rclone

RUN chmod +x rclone


FROM alpine:3.11.5 as build-rclone-sync

RUN apk add --no-cache git && \
      git clone --depth=1 https://github.com/cjnaz/rclonesync-V2.git /opt/ && \
      chmod +x /opt/rclonesync.py


FROM python:3.9-rc-alpine3.10

COPY --from=build-rclone-sync /opt/rclonesync.py /usr/bin/rclonesync
COPY --from=build-rclone /rclone /usr/bin
COPY --from=build-rclone /etc/ssl/certs /etc/ssl/certs
COPY run.py /run.py
RUN chmod +x /run.py

# Local folder to sync
VOLUME ["/sync/"]

ENTRYPOINT ["/run.py"]

# nb config file sought at https://rclone.org/docs/#config-config-file