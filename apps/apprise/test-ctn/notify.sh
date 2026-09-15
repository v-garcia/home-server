#!/bin/sh
curl -v -X POST "http://localhost:8000/notify/apprise" \
    -H "Accept: application/json" \
    -d "tag=test" \
    -d "title=Test Notification" \
    -d "body=This is a test notification from apprise-api"

# inside the container
# apprise --config /config/apprise.yml --tag test --title "Test Notification" --body "Hello :)"