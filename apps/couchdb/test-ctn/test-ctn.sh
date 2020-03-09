#!/bin/sh

docker build --rm -t couchdb ../
docker run\
    --rm \
    -p 3000:3000 \
    -v /data/couchdb_new2:/opt/couchdb/data \
    -v $(pwd)/local.ini:/opt/couchdb/etc/local.d/local.ini \
    -p 5984:5984  \
    couchdb \


    # -e COUCHDB_USER="admin" \
    # -e COUCHDB_PASSWORD="pomme" \