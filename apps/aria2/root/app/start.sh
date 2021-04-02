#!/bin/bash

echo "Run script";

mkdir -p /data/.aria2
touch /data/.aria2/aria2.session

watch-torrents &
nginx -g "daemon off;" &
aria2c --conf-path=/etc/aria2.conf