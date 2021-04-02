#!/bin/bash

cd "$(dirname "$0")"

docker build --rm -t slurp-lemonde ../

source ./.env

docker run\
    -p 3000:3000/tcp \
    -e GOTIFY_URL="$GOTIFY_URL" \
    -e GOTIFY_TOKEN="$GOTIFY_TOKEN" \
     -v $(pwd)/cookies-secret.json:/usr/src/app/cookies.json:ro \
     -v $(pwd)/articles:/usr/src/app/articles \
    --rm \
    slurp-lemonde