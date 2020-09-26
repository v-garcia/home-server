#!/bin/bash

echo "$@"

# /!\ Without trailing slash please
DOWNLOAD_PATH="/downloads"

# get to the base download dir from the first file downloaded
p="$3"
until [[ "$DOWNLOAD_PATH" == "$p" ]]
do
  bpath="$p"
  p=$(dirname "$p")
done

# download name is the name of base file/directory
dl_name=$(basename "$bpath")
echo "Handling torrent $dl_name"

# delete .aria2 control file
rm -rv "$bpath.aria2"

# sending end of download notification
body="{\"title\": \"New file downloaded!\", \"message\":\"File: $dl_name\"}"

curl -X POST \
     -H "X-Gotify-Key: $GOTIFY_TOKEN" \
     -H "Content-type: application/json" \
     -d "$body"\
     --retry 3 \
     --max-time 5 \
     "$GOTIFY_URL/message"