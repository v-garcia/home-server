

FROM telegraf:1.24.1-alpine

# https://hub.docker.com/_/telegraf?tab=description
# https://github.com/influxdata/influxdata-docker/blob/master/telegraf/1.23/alpine/Dockerfile

ARG SPEED_TEST_VERSION="1.0.10"



RUN wget -O - "https://github.com/librespeed/speedtest-cli/releases/download/v${SPEED_TEST_VERSION}/librespeed-cli_${SPEED_TEST_VERSION}_linux_amd64.tar.gz" | tar xz -C  /usr/local/bin && \
    chmod +x /usr/local/bin/librespeed-cli
