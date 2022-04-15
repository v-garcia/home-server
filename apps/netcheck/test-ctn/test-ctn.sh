#!/bin/sh
docker build --rm -t netcheck ../

docker run  -it \
    -p 9000:9000/tcp \
    netcheck
