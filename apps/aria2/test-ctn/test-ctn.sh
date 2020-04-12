#!/bin/bash

. ./.env

docker build --rm -t aria2 ../

docker run \
    --rm \
    --name aria2 \
    -p 6801:80 \
    -p 6800:6800 \
    -e GOTIFY_URL="$GOTIFY_URL" \
    -e GOTIFY_TOKEN="$GOTIFY_TOKEN" \
    -v $(pwd)/data/:/data \
    -v $(pwd)/downloads/:/downloads \
    -v $(pwd)/aria2.conf:/conf/aria2.conf:ro \
    aria2