#!/bin/sh
cd "$(dirname "$0")"

set -a
. ./.env
set +a

envsubst < apprise.yml.template > config/apprise.yml

docker build --rm -t apprise ../

docker run \
    --rm \
    -p 8000:8000 \
    -v $(pwd)/config:/config \
    -e APPRISE_CONFIG_LOCK=yes \
    -e APPRISE_STATEFUL_MODE=simple \
    -e APPRISE_WORKER_COUNT=1 \
    apprise
