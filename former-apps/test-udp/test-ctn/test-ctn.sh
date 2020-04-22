#!/bin/sh
docker build --rm -t test-udp ../
docker run \
    -p 2039:2039/udp \
    test-udp
