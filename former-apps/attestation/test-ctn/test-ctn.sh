#!/bin/bash

source ../.env

docker build --rm -t  attestation ../
docker run \
    -e GOOGLE_API_KEY="$GOOGLE_API_KEY" \
    -p 3000:3000 \
    attestation 