#!/bin/bash

docker build --rm -t rustatio ../

docker rm --force $(docker ps -aq --filter name=rustatio)

docker run \
    --rm \
    --name rustatio \
    -p 8080:8080 \
    -e PORT=8080 \
    -e RUST_LOG=info \
    -v $(pwd)/data/:/data \
    -v $(pwd)/torrents/:/torrents \
    rustatio


# docker exec -it rustatio bash
