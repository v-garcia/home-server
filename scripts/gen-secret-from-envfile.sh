#!/bin/bash

# usage ./scripts/gen-secret-from-envfile.sh radio-autoplaylist

kubectl create secret generic "$1" --from-env-file="apps/$1/.env" --dry-run=client  -o yaml > "apps/$1/$1-secret.yaml"
