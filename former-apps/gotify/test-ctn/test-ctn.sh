#!/bin/sh
docker build --rm -t gotify ../
docker run \
    -e GOTIFY_SERVER_PORT=3000 \
    -e GOTIFY_DATABASE_DIALECT=sqlite3 \
    -e GOTIFY_DATABASE_CONNECTION=/etc/db/gotify.db \
    -e GOTIFY_DEFAULTUSER_NAME=admin \
    -e GOTIFY_DEFAULTUSER_NAME=pomme \
    -v $(pwd)/data/:/etc/db/ \
    -p 3000:3000/tcp \
    gotify
