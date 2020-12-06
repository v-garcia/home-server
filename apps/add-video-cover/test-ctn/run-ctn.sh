#!/bin/bash

source ../.env

docker build --rm -t  add-video-cover ../

docker run \
    -v $(pwd)/media-test:/media/ \
    -e PATH="/media/" \
    -e TMDB_API_KEY="$TMDB_API_KEY" \
    add-video-cover 