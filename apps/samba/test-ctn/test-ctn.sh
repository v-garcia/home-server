#!/bin/sh
docker build --rm -t  samba ../

docker run --net=host \
    -v $(pwd)/share1/:/downloads/ \
    -v $(pwd)/share1/:/public/ \
    -v $(pwd)/share1/:/perso/ \
    -v $(pwd)/../smb.conf:/etc/samba/smb.conf \
    -e USER="vincent" \
    -e PASS="toto" \
    -e UID="1000" \
    -e GID="0" \
    samba

# net use * /delete