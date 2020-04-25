#!/bin/bash

curl -X POST 'http://localhost:6800/jsonrpc' \
    -H 'Content-Type: application/json;' \
    --fail \
    --silent \
    --output /dev/null \
    --data  '{"jsonrpc":"2.0","method":"aria2.tellActive","id":"","params":[]}'