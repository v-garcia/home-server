#!/bin/bash

docker build --rm -t fresh-rss  ../

docker run\
    --rm \
    -e TZ=Europe/Paris \
    -v $(pwd)/config:/config \
    -p 8080:80 \
    fresh-rss 

