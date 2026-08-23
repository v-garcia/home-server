#!/bin/bash

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

source ./.env

kubectl proxy --port=8080 &

docker build --rm -t influxdb  ../

kubectl proxy --port=8080 &

docker run\
    --net=host \
    --rm \
    --privileged \
    -v $PWD/telegraf.conf:/etc/telegraf/telegraf.conf:ro \
    --env-file=$PWD/../.env \
    -v /:/hostfs:ro \
    -e INFLUXDB_URL="$INFLUXDB_URL" \
    -p 8080:80 \
    -e HOST_ETC=/hostfs/etc \
    -e HOST_PROC=/hostfs/proc \
    -e HOST_SYS=/hostfs/sys \
    -e HOST_VAR=/hostfs/var \
    -e HOST_RUN=/hostfs/run \
    -e HOST_MOUNT_PREFIX=/hostfs \
    influxdb