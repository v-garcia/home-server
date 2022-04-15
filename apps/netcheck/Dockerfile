FROM python:3.9-alpine3.14

# https://hub.docker.com/_/python?tab=tags
# https://github.com/sivel/speedtest-cli
# https://github.com/TristanBrotherton

EXPOSE 9000/tcp

ARG GIT_HASH_NETCHECK="81ed016fb185f9fc0c8d35ba59ddb278075c67a1"
ARG GIT_HASH_SPEEDTEST_CLI="22210ca35228f0bbcef75a7c14587c4ecb875ab4"

RUN apk add --no-cache bash

WORKDIR /app/

RUN apk add --no-cache bash git && \
  wget -O - https://github.com/TristanBrotherton/netcheck/archive/${GIT_HASH_NETCHECK}.tar.gz | tar xz --strip=1 && \
  wget -O speedtest-cli https://raw.githubusercontent.com/sivel/speedtest-cli/${GIT_HASH_SPEEDTEST_CLI}/speedtest.py && \
  chmod +x speedtest-cli netcheck.sh

ENTRYPOINT ["./netcheck.sh", "-w"]
