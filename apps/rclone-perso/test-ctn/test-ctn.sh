#!/bin/sh
docker build --rm -t rclone-perso-test ../
docker run\
    --rm \
    -v $(pwd)/.rclone-secret.conf:/.rclone.conf \
    -v $(pwd)/working-dir/:/.rclonesyncwd/ \
    -v $(pwd)/filters.txt:/rclone-filter \
    -v $(pwd)/filters.txt-MD5:/rclone-filter-MD5 \
    -v $(pwd)/sync:/sync/ \
    --user 1500:2500 \
    rclone-perso-test \
    --config "/.rclone.conf" \
    --workdir "/.rclonesyncwd/" \
    --filters-file "/rclone-filter" \
    "/sync/" "zaclys:/"
