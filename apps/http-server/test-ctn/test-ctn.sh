#!/bin/sh
docker build --rm -t http-server ../
docker run \
    -p 8000:8000 \
    -v $(pwd)/data:/data/ \
    http-server \
    -u \
    /data/
