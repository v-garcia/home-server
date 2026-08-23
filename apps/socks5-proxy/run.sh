#!/bin/bash

docker run -d --name socks5 -p 1080:1080 -e PROXY_USER=elsa -e PROXY_PASSWORD=lachoucroute  serjs/go-socks5-proxy