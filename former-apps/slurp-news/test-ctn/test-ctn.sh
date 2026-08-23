#!/bin/bash

cd "$(dirname "$0")"

docker build --rm -t slurp-lemonde ../

source ./.env

docker run\
    -p 3000:3000/tcp \
    -e GOTIFY_URL="$GOTIFY_URL" \
    -e GOTIFY_TOKEN="$GOTIFY_TOKEN" \
    -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
    -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
    -e AWS_REGION="$AWS_REGION" \
    -e AWS_S3_ENDPOINT="$AWS_S3_ENDPOINT" \
    -e APP_BUCKET="$APP_BUCKET" \
     -v $(pwd)/articles:/usr/src/app/articles \
    --rm \
    slurp-lemonde