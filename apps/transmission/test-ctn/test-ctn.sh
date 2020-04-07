#!/bin/bash

source ./../.env

docker build --rm -t transmission ../

# docker run\
#     --rm \
#     -e TZ=Europe/Paris \
#     -e GOTIFY_URL="$GOTIFY_URL" \
#     -e GOTIFY_TOKEN="$GOTIFY_TOKEN" \
#     -e TRANSMISSION_WEB_HOME="/combustion-release/" \
#     -v $(pwd)/downloads/:/downloads \
#     -v $(pwd)/incomplete/:/incomplete \
#     -v $(pwd)/config:/config \
#     -v $(pwd)/settings.json:/config/settings.json:ro \
#     -v $(pwd)/watchdir:/watch \
#     -p 9092:9091 \
#     --rm \
#     transmission


# -p 51413:51413 \