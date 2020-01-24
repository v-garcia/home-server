#!/bin/sh
echo "Starting start wrapper"

/usr/bin/configure "mondaying@hotmail.com" "empire66"


while true
do
# source /opt/JDownloader/daemon.sh
source /opt/JDownloader/daemon.sh
# echo "jdownloader exited with code $?"
echo "jdownloader exited with code $EXIT_STATUS"


if [ "$EXIT_STATUS" -ne 0 ]
then
  exit $EXIT_STATUS
fi

sleep 2
done