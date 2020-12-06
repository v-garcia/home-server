#!/bin/bash


docker build --rm -t yarr ../

docker run\
    --rm \
    -v $(pwd)/data/:/data \
    -v $(pwd)/images/:/var/www/wallabag/web/assets/images \
    -p 7070:7070 \
    yarr
