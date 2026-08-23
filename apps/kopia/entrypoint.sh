#!/bin/sh
set -eu

: "${AWS_ACCESS_KEY_ID:?AWS_ACCESS_KEY_ID is required}"
: "${AWS_SECRET_ACCESS_KEY:?AWS_SECRET_ACCESS_KEY is required}"
: "${AWS_REGION:?AWS_REGION is required}"
: "${AWS_S3_ENDPOINT:?AWS_S3_ENDPOINT is required}"
: "${KOPIA_PASSWORD:?KOPIA_PASSWORD is required}"

BUCKET="${KOPIA_S3_BUCKET:-kopia-backup-00}"
ENDPOINT="${AWS_S3_ENDPOINT#https://}"
ENDPOINT="${ENDPOINT#http://}"

if ! kopia repository status >/dev/null 2>&1; then
  echo "Connecting to kopia repository on s3://$BUCKET ..."
  if ! kopia repository connect s3 \
      --bucket="$BUCKET" \
      --endpoint="$ENDPOINT" \
      --region="$AWS_REGION" >/tmp/kopia-connect.log 2>&1; then
    echo "No existing repository found, creating one on s3://$BUCKET ..."
    kopia repository create s3 \
      --bucket="$BUCKET" \
      --endpoint="$ENDPOINT" \
      --region="$AWS_REGION"
  fi
fi

exec "$@"
