#!/bin/bash

# usage ./gen-configmap.sh minidlna ./apps/minidlna/test-ctn/minidlna.conf ./apps/minidlna/

sed -i 's/\t/    /g' "$2"
sed -i -E 's/[[:space:]]+$//g' "$2"
kubectl create configmap "$1" --from-file="$2" --dry-run  -o yaml > "$3/$1-cm.yaml"