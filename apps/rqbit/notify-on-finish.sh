#!/bin/bash

# Listen to rqbit log stream and send an apprise notification when a torrent is finished.
# Relies on the log event emitted by librqbit (crates/librqbit/src/torrent_state/live/mod.rs):
#   info!(id=..., info_hash=..., "torrent finished downloading");
# Notifications happening while the stream is disconnected are lost (acceptable).

RQBIT_URL="${RQBIT_URL:-http://localhost:3030}"
RECONNECT_DELAY="${RECONNECT_DELAY:-5}"

notify(){
    name=$(curl -sf --max-time 5 "$RQBIT_URL/torrents/$1" | jq -r '.name // empty')
    name="${name:-torrent #$1}"
    echo "Torrent finished: $name"

    curl -X POST \
         -H "Accept: application/json" \
         -d "tag=rqbit,torrent,download-finished" \
         -d "title=New file downloaded!" \
         --data-urlencode "body=File: $name" \
         --silent \
         --output /dev/null \
         --retry 3 \
         --max-time 5 \
         "$APPRISE_URL" || echo "Failed to notify apprise for $name"
}

while true
do
    echo "Connecting to $RQBIT_URL/stream_logs"
    curl -sfN "$RQBIT_URL/stream_logs" |
        jq --unbuffered -rR 'fromjson? | select(.fields.message == "torrent finished downloading") | .fields.id' |
        while read -r id; do notify "$id"; done
    echo "Log stream disconnected, reconnecting in ${RECONNECT_DELAY}s"
    sleep "$RECONNECT_DELAY"
done
