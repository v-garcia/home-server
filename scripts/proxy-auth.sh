#!/bin/bash

# sudo apt-get install mitmproxy

source ./.env
mitmdump --mode reverse:"$PROXY_TARGET" --setheaders :~q:Authorization:"$AUTH_TOKEN"