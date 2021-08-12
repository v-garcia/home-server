#!/bin/bash

cd "$(dirname "$0")"

docker build --rm -t boursorama-tracker ../

source ../.env

docker run\
    -p 3000:3000/tcp \
    -e GOTIFY_URL="$GOTIFY_URL" \
    -e GOTIFY_TOKEN="$GOTIFY_TOKEN" \
    -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
    -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
    -e AWS_REGION="$AWS_REGION" \
    -e AWS_S3_ENDPOINT="$AWS_S3_ENDPOINT" \
    -e BOURSO_ACCOUNT_0="$BOURSO_ACCOUNT_0" \
    -e BOURSO_USER_0="$BOURSO_USER_0" \
    -e BOURSO_PWD_0="$BOURSO_PWD_0" \
    -e WORKING_DIR="/downloads" \
     -v $(pwd)/downloads:/downloads \
    --rm \
    boursorama-tracker
