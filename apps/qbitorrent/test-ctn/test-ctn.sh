#!/bin/bash

source ./../.env

docker build --rm -t qbitorrent ../

docker run\
    --rm \
    -e TZ=Europe/Paris \
    -e GOTIFY_URL="$GOTIFY_URL" \
    -e GOTIFY_TOKEN="$GOTIFY_TOKEN" \
    -v $(pwd)/downloads/:/downloads/ \
    -v $(pwd)/config:/config/ \
    -v $(pwd)/watchdir:/watchdir/ \
    -p 8080:8080 \
    qbitorrent
