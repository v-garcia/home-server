#!/bin/sh
docker build --rm -t grafana ../
docker run \
    -p 3000:3000/tcp \
    grafana
