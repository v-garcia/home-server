#!/bin/bash

source ./.env

docker build --rm -t influxdb  ../

docker run\
    --rm \
    -v $PWD/data:/var/lib/influxdb2 \
    -v $PWD/config:/etc/influxdb2 \
    --env-file=./../.env \
    -p 8086:8086 \
    --rm \
    influxdb