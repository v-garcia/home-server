#!/bin/bash

docker build --rm -t boss-restarter ../

docker run \
    --rm \
    -v $PWD/config.secret:/root/.aws/config \
    -v $PWD/credentials.secret:/root/.aws/credentials \
    --env-file=../.env \
    --rm \
    boss-restarter