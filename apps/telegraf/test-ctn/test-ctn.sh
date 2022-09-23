#!/bin/bash

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

source ./.env

kubectl proxy --port=8080 &

docker build --rm -t influxdb  ../

docker run\
    -v $PWD/telegraf.conf:/etc/telegraf/telegraf.conf:ro \
    -v /data/:/data/:ro \
    --env-file=$PWD/../.env \
    -e INFLUXDB_URL="$INFLUXDB_URL" \
    influxdb