#!/bin/sh
docker build --rm -t http-server ../

docker run \
    -p 3000:80 \
    -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/data:/var/www:ro \
    http-server \
  