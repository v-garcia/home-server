#!/bin/sh
docker build --rm -t http-server ../
docker run \
    http-server \
    --help

