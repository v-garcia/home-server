#!/bin/sh
docker build --rm -t s3-to-influxdb ../

docker run \
    --env-file ./.env \
    -v $(pwd)/config.yaml:/etc/s3-to-influx-conf.yaml:ro \
    s3-to-influxdb
    
