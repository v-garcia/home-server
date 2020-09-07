#!/bin/bash

# usage ./gen-configmap.sh minidlna ./apps/minidlna/test-ctn/minidlna.conf ./apps/minidlna/

kubectl create configmap "$1" --from-file="$2" --dry-run  -o yaml > "$3/$1-cm.yaml"