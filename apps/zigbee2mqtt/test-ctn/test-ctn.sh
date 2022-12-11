#!/bin/sh

# kubectl port-forward service/mosquitto 1883:1883

docker build --rm -t zigbee2mqtt ../

docker run \
    -e TZ=Europe/Paris \
    -e ZIGBEE2MQTT_CONFIG_MQTT_SERVER=mqtt://localhost:1883 \
    --net=host \
    -v $(pwd)/data:/app/data \
    -v $(pwd)/configuration.yaml:/app/data/configuration.yaml \
    --device=/dev/serial/by-id/usb-ITead_Sonoff_Zigbee_3.0_USB_Dongle_Plus_b6ab06268c29ec1198856d7840c9ce8d-if00-port0:/dev/ttyACM0 \
    -p 9090:8080 \
    zigbee2mqtt
