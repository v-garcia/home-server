#!/bin/sh
docker build --rm -t  minidlna ../
docker run --net=host \
    -p 8200:8200 \
    -v $(pwd)/videos:/media/video \
    -e MINIDLNA_MEDIA_DIR=V,/media/video \
    -e MINIDLNA_FRIENDLY_NAME=MyMini \
    minidlna
