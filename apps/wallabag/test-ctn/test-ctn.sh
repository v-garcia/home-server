#!/bin/bash


docker build --rm -t wallabag ../

docker run\
    --rm \
    -e SYMFONY__ENV__DOMAIN_NAME="http://localhost:3000" \
    -v $(pwd)/data/:/var/www/wallabag/data \
    -v $(pwd)/images/:/var/www/wallabag/web/assets/images \
    -p 3000:80 \
    wallabag
