#!/bin/bash

docker build --rm -t jellyfin  ../

docker run \
    --rm \
    --name my_jellyfin_server \
    -v $(pwd)/config:/config \
    -v /data/aria2/downloads:/media/aria2 \
    -p 8096:8096/tcp \
    -e TZ=Europe/Paris \
    -e UID=0 \
    -e GID=0 \
    --device /dev/dri:/dev/dri \
    jellyfin


    # -v $(pwd)/minidlna.conf:/etc/minidlna.conf \