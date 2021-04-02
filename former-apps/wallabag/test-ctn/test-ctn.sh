#!/bin/bash

docker build --rm -t wallabag ../

docker run \
    --rm \
    -v $(pwd)/data/:/var/www/wallabag/data \
    -v $(pwd)/images/:/var/www/wallabag/web/assets/images \
    -e SYMFONY__ENV__DOMAIN_NAME="http://localhost:3000" \
    -e SYMFONY__ENV__FOSUSER_REGISTRATION="false" \
    -p 3000:80 \
    wallabag
