#!/bin/sh
docker build --rm -t edith-test ../
docker run\
    --rm \
    -v $(pwd)/data/:/app/data/ \
    -p 9000:80/tcp \
    edith-test
