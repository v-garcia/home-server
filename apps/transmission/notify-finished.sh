#!/bin/sh


BODY=$( printf '{"title": "New torrent downloaded!", "message":"File: %s"}\n' "$TR_TORRENT_NAME")

echo "$BODY"

curl -XPOST \
     -H "X-Gotify-Key: $GOTIFY_TOKEN" \
     -H "Content-type: application/json" \
     -d "$BODY"\
     --retry 3 \
     "$GOTIFY_URL/message"