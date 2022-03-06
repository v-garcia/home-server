#!/bin/sh
docker build --rm -t home-assistant ../

docker run \
    -e TZ=Europe/Paris \
    -v $(pwd)/config:/config \
    --device=/dev/ttyUSB0 \
    -p 8123:8123/tcp \
    home-assistant


# -v $(pwd)/config-secret.json:/updater/data/config.json \