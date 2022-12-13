#!/bin/sh
docker build --rm -t mosquitto-test ../
docker run\
    --rm \
    -v $(pwd)/data/data:/mosquitto/data  \
    -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf:ro \
    -v $(pwd)/data/log:/mosquitto/log  \
    -p 1883:1883/tcp \
    -p 9001:9001/tcp \
    mosquitto-test
