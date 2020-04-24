#!/bin/bash

echo "Run script";

mkdir -p /incomplete/.aria2
touch /incomplete/.aria2/aria2.session

watch-torrents &
nginx -g "daemon off;" &
aria2c --conf-path=/etc/aria2.conf