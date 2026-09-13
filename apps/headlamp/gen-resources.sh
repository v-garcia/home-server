#!/bin/bash

cd "$(dirname "$0")"

BUILD="kustomize build . --load-restrictor LoadRestrictionsNone --enable-alpha-plugins"

# First pass: make sure the SA/secret exist (harmless if the ingress
# annotations still contain the {{BEARER}} placeholder at this point).
$BUILD | kubectl apply -f -

token=$(kubectl -n default get secret headlamp-token -o jsonpath='{.data.token}' | base64 -d)

# Second pass: re-render with the real token injected into the ingress
# Authorization header so Headlamp logs in automatically.
$BUILD | sed -e "s/{{BEARER}}/$token/g" | kubectl apply -f -
