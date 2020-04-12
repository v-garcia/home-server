#!/bin/sh

echo "$@"

# /!\ Without trailing slash please
DATA_PATH="/data"
DOWNLOAD_PATH="/downloads"

path="$3"
dir=$(dirname "$path")

if [ "$dir" = "$DATA_PATH" ]; then
    dir=$path
fi

echo "dir: $dir"
file_name=$(basename "$dir")

body=$( printf '{"title": "New file downloaded!", "message":"File: %s"}\n' "$file_name")

echo "$body"

wget -O- -q \
    --header="X-Gotify-Key: $GOTIFY_TOKEN" \
    --header="Content-type: application/json" \
    --post-data="$body"\
    --tries=3 \
    "$GOTIFY_URL/message"

mv -f -v "$dir" "$DOWNLOAD_PATH"