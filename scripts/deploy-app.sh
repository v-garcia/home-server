#!/bin/bash

APP_NAME="$1"
SCRIPT_DIR=$(realpath $(dirname "$0"))

cd "$SCRIPT_DIR"
cd ../apps/$APP_NAME


if [ -f "./kustomization.yaml" ]; then
    echo "kustomization file exists"
    kustomize build . --load_restrictor none | kubectl apply -f -
else 
    echo "kustomization doesnt exists"
    kubectl apply -f .
fi
