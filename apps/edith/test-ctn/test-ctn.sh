#!/bin/sh
docker build --rm -t edith-test ../
docker run\
    --rm \
    -v $(pwd)/data/:/app/data/ \
    -p 80:3000/tcp \
    edith-test
