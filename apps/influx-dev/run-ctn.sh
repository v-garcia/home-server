#!/bin/bash

docker build --rm -t influxdb-dev  ./

docker run \
    --rm \
    -v $PWD/data:/data \
    --env-file=.env \
    --rm \
    influxdb-dev