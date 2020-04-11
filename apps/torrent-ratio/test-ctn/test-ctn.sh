#!/bin/sh

docker build --rm -t ratio ../
docker run \
    --rm \
    -v $(pwd)/t.torrent:/t.torrent \
    -e UPLOAD_SPEED=8000 \
    ratio