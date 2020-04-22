#!/bin/bash

SERVICE_NAME="samba"
INGRESS_NS="ingress"
INGRESS_CONTROLLER="nginx-ingress-microk8s"

# "137/UDP" "138/UDP"
ports=("139/TCP" "445/TCP" )

for e in ${ports[@]}; 
do 
    IFS="/";
    set $e; 
    port=$1;
    protocol=$2;
    
    # patch controller {udp/tcp}-services config-map
    kubectl patch configmap "${protocol,,}-services" -n "$INGRESS_NS" --patch "{\"data\":{\"$port\":\"default/$SERVICE_NAME:$port\"}}"

    # patch controller itself
    kubectl -n "$INGRESS_NS" patch ds nginx-ingress-microk8s-controller  \
        --patch "{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"$INGRESS_CONTROLLER\",\"ports\":[{\"containerPort\":$port,\"hostPort\":$port,\"protocol\":\"$protocol\"}]}]}}}}"
done