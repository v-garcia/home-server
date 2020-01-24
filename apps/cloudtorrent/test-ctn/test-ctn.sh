#!/bin/sh
docker build --rm -t cloudtorrent-test ../
docker run\
    --rm \
    -p 3000:3000 \
    -v $(pwd)/downloads/:/downloads/ \
    -v $(pwd)/watchdir:/watchdir/ \
    -v $(pwd)/cloud-torrent.json:/cloud-torrent.json:ro \
    --user 1500:2500 \
    cloudtorrent-test \
