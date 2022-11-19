#!/bin/sh
docker build --rm -t woob-extractor ../

docker run \
    --env-file ./.env \
    -v $(pwd)/../config.yaml:/etc/config.yaml:ro \
    woob-extractor
    
