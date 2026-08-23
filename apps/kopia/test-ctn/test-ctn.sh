#!/bin/bash

cd "$(dirname "$0")"

set -a
source ./.env
set +a

docker build --rm -t kopia-test ../

docker run \
    --rm -it \
    --env-file=./.env \
    -p 51515:51515 \
    -v $(pwd)/data:/data:ro \
    -v $(pwd)/config:/app/config \
    -v $(pwd)/cache:/app/cache \
    -v $(pwd)/logs:/app/logs \
    kopia-test \
    kopia server start \
    --address=0.0.0.0:51515 \
    --insecure \
    --disable-csrf-token-checks \
    --without-password \
    --allow-extremely-dangerous-unauthenticated-server-on-the-network

# web UI: http://localhost:51515 (no auth - an external ingress will handle basic auth later)
