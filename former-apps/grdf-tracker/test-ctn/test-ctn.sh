#!/bin/sh
docker build --rm -t grdf-tracker ../

docker run \
    grdf-tracker
