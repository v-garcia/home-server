#!/bin/sh
docker build --rm -t vaultwarden ../

docker run \
    -p 3000:3000 \
    -v $(pwd)/data/:/data/ \
    -e ROCKET_PORT=3000 \
    -e SHOW_PASSWORD_HINT=false \
    vaultwarden
  