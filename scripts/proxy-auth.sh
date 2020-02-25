#!/bin/bash

# sudo apt-get install mitmproxy
# fuser -k 8080/tcp

source ./.env
mitmdump --mode reverse:"$PROXY_TARGET" --setheaders :~q:Authorization:"$AUTH_TOKEN"