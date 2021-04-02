#!/bin/bash

cd "$(dirname "$0")"

docker build --rm -t radio-autoplaylist ../

docker run\
    --env-file=./../.env \
    -v $(pwd)/../data:/usr/src/app/data \
    --rm \
    radio-autoplaylist