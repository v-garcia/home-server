#!/bin/bash

APP_NAME="$1"
SCRIPT_DIR=$(realpath $(dirname "$0"))

cd "$SCRIPT_DIR"
cd ../apps/$APP_NAME

# adding template
cp -nv $SCRIPT_DIR/templates/kustomization-base.yaml ./kustomization.yaml

# reseting resources
yq w -i ./kustomization.yaml resources []

# adding all resources to reources field
for f in ./$APP_NAME-*.yaml; do
  echo "Adding resources -> $fname"
  fname=$(basename $f)
  yq w -i ./kustomization.yaml resources[+] $fname
done