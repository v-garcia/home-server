#!/bin/bash

source ../.env

docker build --rm -t  upload ../
docker run \
    -v $(pwd)/default:/data/default/ \
    -v $(pwd)/private:/data/private/ \
    -v $(pwd)/public/:/data/public/ \
    -v $(pwd)/uploads/:/data/uploads/ \
    -e UPLOAD_TEMP_DIR="/data/uploads/" \
    -e UPLOAD_PUBLIC_DIR="/data/public/" \
    -e UPLOAD_PRIVATE_DIR="/data/private/" \
    -e UPLOAD_DEFAULT_DIR="/data/private/" \
    -e GOTIFY_URL="$GOTIFY_URL" \
    -e GOTIFY_TOKEN="$GOTIFY_TOKEN" \
    -p 8080:8080 \
    upload 