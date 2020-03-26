#!/bin/bash

docker build --rm -t navidrome ../

docker run\
    --rm \
    -v $(pwd)/data/:/data/ \
    -v /data/public/music:/music/:ro \
    -p 4533:4533 \
    -e ND_SCANINTERVAL=5m \
    navidrome
