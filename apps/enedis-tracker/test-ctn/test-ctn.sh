#!/bin/bash

cd "$(dirname "$0")"

docker build --rm -t enedis-tracker ../

source ./../.env

docker run\
    -e ENEDIS_EMAIL="$ENEDIS_EMAIL" \
    -e ENEDIS_PASSWORD="$ENEDIS_PASSWORD" \
    -e GOTIFY_URL="$GOTIFY_URL" \
    -e GOTIFY_TOKEN="$GOTIFY_TOKEN" \
    -e COUCHDB_URL="$COUCHDB_URL" \
    --network="host" \
    --rm \
    enedis-tracker \
    "daily"
