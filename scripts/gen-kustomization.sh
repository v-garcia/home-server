#!/bin/bash

APP_NAME="$1"
SCRIPT_DIR=$(realpath $(dirname "$0"))

cd "$SCRIPT_DIR"
cd ../apps/$APP_NAME

# adding template
cp -nv $SCRIPT_DIR/templates/kustomization-base.yaml ./kustomization.yaml

# reseting resources
yq -i '.resources=[]' ./kustomization.yaml

# adding all resources to reources field
for f in ./$APP_NAME-*.yaml; do
    fname=$(basename $f)
    echo "Adding resources -> $fname"
    [[ ! -z "$fname" ]] && yq -i ".resources += \"$fname\"" ./kustomization.yaml
done