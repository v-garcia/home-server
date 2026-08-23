#!/bin/bash

docker build  --rm -t  radio-autoplaylist-frontend  ../

docker run \
    -p 3000:3000/tcp \
    --rm \
    -v $(pwd)/../.env:/app/.env:ro \
    radio-autoplaylist-frontend 