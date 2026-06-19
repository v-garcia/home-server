#!/bin/bash

docker build --rm -t emby  ../

docker run --net=host \
    --rm \
    -v $(pwd)/data:/data \
    -v $(pwd)/config:/config \
    -v /data/aria2/downloads:/media/aria2 \
    -p 8096:8096/tcp \
    -e UID=0 \
    -e GID=0 \
    --device /dev/dri:/dev/dri \
    emby


    # -v $(pwd)/minidlna.conf:/etc/minidlna.conf \