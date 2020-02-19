#!/bin/sh

docker build --rm -t couchdb ../
docker run\
    --rm \
    -p 3000:3000 \
    -v $(pwd)/data:/opt/couchdb/data \
    -p 5984:5984  \
    couchdb \


    # -e COUCHDB_USER="admin" \
    # -e COUCHDB_PASSWORD="pomme" \