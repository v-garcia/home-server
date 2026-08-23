#!/bin/bash

docker build --rm -t influx-notifs ../

docker run \
    --rm \
    -v $PWD/data:/data \
    --env-file=../.env \
    --rm \
    influx-notifs