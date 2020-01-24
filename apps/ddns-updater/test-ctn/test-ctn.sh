#!/bin/sh
docker build --rm -t ddns-updater-test ../
docker run\
    --rm \
    -v $(pwd)/config.json:/updater/data/config.json:ro \
    -p 8000:8000/tcp \
    ddns-updater-test

# --user 1500:2500 \