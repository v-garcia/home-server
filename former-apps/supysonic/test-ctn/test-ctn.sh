#!/bin/sh
docker build --rm -t supysonic ../
docker run \
    -p 8080:8080 \
    -v $(pwd)/data:/var/lib/supysonic \
    -v /data/public/music/CIRC:/media/:ro \
    -v $(pwd)/password.key:/run/secrets/supysonic:ro \
    supysonic

    # -e 'RUN_WATCHER="true"' \