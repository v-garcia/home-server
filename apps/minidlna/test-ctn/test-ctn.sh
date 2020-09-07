#!/bin/bash



docker build --rm -t minidlna  ../

docker run --net=host \
    --rm \
    -v $(pwd)/data:/data \
    -v $(pwd)/minidlna.conf:/etc/minidlna.conf \
    -v /data/sabnzbd/downloads:/media/sabnzbd \
    -v /data/aria2/downloads:/media/aria2 \
    -v /data/public:/media/public \
    minidlna 


    # -v $(pwd)/minidlna.conf:/etc/minidlna.conf \