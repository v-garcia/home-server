#!/bin/bash

echo "$@"

# /!\ Without trailing slash please
DATA_PATH="/incomplete"
DOWNLOAD_PATH="/downloads"

# path of the first file
path="$3"

# get to the base download dir
p=$path
until [[ $DATA_PATH == $p ]]
do
  dir=$p
  parent=$(dirname "$p")
done

body=$( printf '{"title": "New file downloaded!", "message":"File: %s"}' "$file_name")

mv -f -v "$dir" "$DOWNLOAD_PATH"

curl -XPOST \
     -H "X-Gotify-Key: $GOTIFY_TOKEN" \
     -H "Content-type: application/json" \
     -d "$body"\
     --retry 3 \
     "$GOTIFY_URL/message"