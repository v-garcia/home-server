#!/bin/sh
docker build --rm -t googlemusic ../
docker run \
    -e UPLOADER_ID=9C:79:A3:22:ED:95 \
    -v $(pwd)/auth:/root/oauth/ \
    -v $(pwd)/music:/data/public/music/ \
    -v $(pwd)/auth/oauth.key:/root/oauth/oauth.key \
    googlemusic
