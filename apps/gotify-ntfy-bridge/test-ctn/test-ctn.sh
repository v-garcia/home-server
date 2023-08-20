#!/bin/bash

docker build --rm -t gotify-ntfy-bridge ../

docker run \
    --rm \
    --env-file=../.env \
    gotify-ntfy-bridge