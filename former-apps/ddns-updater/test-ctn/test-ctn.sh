#!/bin/sh
docker build --rm -t ddns-updater-test ../
docker run\
    --rm \
    -v $(pwd)/data:/updater/data \
    -v $(pwd)/config-secret.json:/updater/data/config.json \
    -p 8000:8000/tcp \
    ddns-updater-test
