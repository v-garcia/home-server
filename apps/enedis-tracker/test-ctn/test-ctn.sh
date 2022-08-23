#!/bin/bash

cd "$(dirname "$0")"

docker build --rm -t enedis-tracker ../

source ./../.env

docker run\
    --env-file=./../.env \
    --network="host" \
    --rm \
    enedis-tracker \
    "daily"
