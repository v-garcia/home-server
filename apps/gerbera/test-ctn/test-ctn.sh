#!/bin/sh
docker build --rm -t  gerbera ../

docker run --net=host \
    -v $(pwd)/home/:/root/ \
    -v $(pwd)/config.xml/:/root/.config/gerbera/config.xml:ro \
    -v /data/ctorrent/downloads:/media/torrent \
    gerbera

 # -v /data/ctorrent/downloads:/media/video \