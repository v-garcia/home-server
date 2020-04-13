#!/bin/bash

source ./.env

docker build --rm -t heimdall  ../

docker run\
    --rm \
    -e TZ=Europe/Paris \
    -v $(pwd)/config:/config \
    -p 8080:80 \
    --rm \
    heimdall 

