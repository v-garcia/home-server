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
curl -X POST \
     -H "Accept: application/json" \
     -d "tag=aria2,torrent,download-finished" \
     -d "title=New file downloaded!" \
     -d "body=File: $dl_name" \
     --retry 3 \
     --max-time 5 \
     "$APPRISE_URL"