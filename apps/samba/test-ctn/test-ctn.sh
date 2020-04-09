#!/bin/sh
docker build --rm -t  samba ../

docker run --net=host \
    -v $(pwd)/share1/:/share1/ \
    -e USERID="0" \
    -e GROUPID="0" \
    samba \
    -u "toto;toto;" \
    -g "ntlm auth = yes" \
    -s "share1;/share1;yes;no;yes;toto;" \
    -n

# net use * /delete