#!/bin/sh
docker build --rm -t note-mark ../

docker run  -it \
    -p 8000:8000/tcp \
    -v $(pwd)/data:/data \
    -e JWT_SECRET="bXktc2VjcmV0" \
    -e CORS_ORIGINS="localhost:8000" \
    note-mark
