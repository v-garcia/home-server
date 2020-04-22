#!/bin/bash

INGRESS_NS="ingress"
TCP_CM="{ \"apiVersion\": \"v1\", \"kind\": \"ConfigMap\", \"metadata\": { \"name\": \"tcp-services\", \"namespace\": \"$INGRESS_NS\" }, \"data\": null}"
UDP_CM="{ \"apiVersion\": \"v1\", \"kind\": \"ConfigMap\", \"metadata\": { \"name\": \"udp-services\", \"namespace\": \"$INGRESS_NS\" }, \"data\": null}"

# create namespaces
echo "$TCP_CM $UDP_CM" | kubectl create -f -
create_status=$?


# kubectl patch ds

PATCH='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--tcp-services-configmap=$(POD_NAMESPACE)/tcp-services"},{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--udp-services-configmap=$(POD_NAMESPACE)/udp-services"}]'


if [[ $create_status -eq 0 ]]; then
    kubectl -n "$INGRESS_NS" patch ds nginx-ingress-microk8s-controller --type json   -p=$PATCH
fi