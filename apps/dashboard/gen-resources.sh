#!/bin/bash

cd "$(dirname "$0")"

source ./.env

DASHBOARD_NS="kubernetes-dashboard"

secret_name=$(kubectl -n $DASHBOARD_NS get secret | awk '/^kubernetes-dashboard-token-/{print $1}')
token=$(kubectl -n $DASHBOARD_NS describe secret $secret_name | awk '$1=="token:"{print $2}')

kustomize build ./ --load-restrictor LoadRestrictionsNone \
  | sed -e "s/{{BEARER}}/$token/g" \
  | sed -e "s/{{ALLOWED_EXTERNAL_IPS}}/$ALLOWED_EXTERNAL_IPS/g"