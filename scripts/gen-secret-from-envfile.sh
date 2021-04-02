#!/bin/bash

# usage ./scripts/gen-secret-from-envfile.sh radio-autoplaylist apps/radio-autoplaylist/.env apps/radio-autoplaylist/

kubectl create secret generic "$1" --from-env-file="$2" --dry-run  -o yaml > "$3/$1-secret.yaml"
