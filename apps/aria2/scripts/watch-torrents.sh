#!/bin/bash

# https://github.com/unidev39/Oracle_DBA_Research/blob/b9a5db1f1dac2a2dbd50a3d95cba90dc34af12c8/inotifywait.sh

aria2_port=6800
watch_dir="/watchdir"
done_dir="$watch_dir/done"
err_dir="$watch_dir/errors"
mkdir -p "$done_dir"
mkdir -p "$err_dir"

handle_torrent(){
    post_file="$1.body"
    b64_torrent=$(base64 -w 0 "$1")
    uid="AUTOWATCH_$(date +%s)_$(echo "$1" | base64)"
    
    echo -n "{\"jsonrpc\":\"2.0\", \"method\":\"aria2.addTorrent\", \"id\": \"$uid\", \"params\": [\"$b64_torrent\",[],{}]}" > "$post_file"

    curl -X POST "http://localhost:$aria2_port/jsonrpc" \
        --fail \
        --retry 2 \
        --max-time 10 \
        -H 'Content-Type: application/json;charset=UTF-8' \
        -H 'Cache-Control: no-cache'  \
        -d "@$post_file";

    handle_success=$?

    rm -f "$post_file"

    return $handle_success
}

inotifywait -m $watch_dir -e close_write,moved_to |
while read folder _ file; do
 filename="$folder$file"
 if [[ -f "$filename" && $filename =~ .torrent$ ]]; then 

    echo "Handling torrent $filename"

    sleep 1

    handle_torrent "$filename"

    if [[ $? -eq 0 ]]
    then
        mv -v "$filename" "$done_dir"
    else
        mv -v "$filename" "$err_dir"
    fi
 fi
done