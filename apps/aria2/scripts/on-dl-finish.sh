#!/bin/bash

echo "$@"

# /!\ Without trailing slash please
DATA_PATH="/incomplete"
DOWNLOAD_PATH="/downloads"


# file basename
file_name=$(basename "$3")

# get to the base download dir from the first file downloaded
p="$3"
until [[ "$DATA_PATH" == "$p" ]]
do
  bpath="$p"
  p=$(dirname "$p")
done

mv -v --backup=t "$bpath" "$DOWNLOAD_PATH"

body="{\"title\": \"New file downloaded!\", \"message\":\"File: $file_name\\nMove status: $?\"}"

curl -X POST \
     -H "X-Gotify-Key: $GOTIFY_TOKEN" \
     -H "Content-type: application/json" \
     -d "$body"\
     --retry 3 \
     "$GOTIFY_URL/message"