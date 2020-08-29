#!/bin/sh
docker build --rm -t googlemusicmanager ../
docker run\
    --entrypoint /root/auth \
    -v $(pwd)/auth:/root/oauth/ \
    -ti \
    googlemusicmanager
sudo cat ./auth/oauth.key | base64