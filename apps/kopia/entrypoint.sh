#!/bin/bash
set -euo pipefail

# Two modes:
# - default (kopia server): connect to the repository then exec the command.
# - NOTIFY_ON_FAILURE=true (one-shot jobs, e.g. the backup CronJob): run the command and send an
#   apprise notification (APPRISE_URL) with the end of the output if anything fails.

setup(){
  : "${AWS_ACCESS_KEY_ID:?AWS_ACCESS_KEY_ID is required}"
  : "${AWS_SECRET_ACCESS_KEY:?AWS_SECRET_ACCESS_KEY is required}"
  : "${AWS_REGION:?AWS_REGION is required}"
  : "${AWS_S3_ENDPOINT:?AWS_S3_ENDPOINT is required}"
  : "${KOPIA_PASSWORD:?KOPIA_PASSWORD is required}"

  local bucket="${KOPIA_S3_BUCKET:-kopia-backup-00}"
  local endpoint="${AWS_S3_ENDPOINT#https://}"
  endpoint="${endpoint#http://}"

  # Explicit "|| return 1": set -e is not effective when setup is called from an && list
  if ! kopia repository status >/dev/null 2>&1; then
    echo "Connecting to kopia repository on s3://$bucket ..."
    if ! kopia repository connect s3 \
        --bucket="$bucket" \
        --endpoint="$endpoint" \
        --region="$AWS_REGION" >/tmp/kopia-connect.log 2>&1; then
      echo "No existing repository found, creating one on s3://$bucket ..."
      kopia repository create s3 \
        --bucket="$bucket" \
        --endpoint="$endpoint" \
        --region="$AWS_REGION" || return 1
    fi
  fi
}

if [ "${NOTIFY_ON_FAILURE:-false}" != "true" ]; then
  setup
  exec "$@"
fi

: "${APPRISE_URL:?APPRISE_URL is required when NOTIFY_ON_FAILURE=true}"

notify_failure(){
  local rc=$1
  # Pushover caps messages at 1024 chars: keep only the end of the output
  local body
  body="Exit code: $rc"$'\n'"$(tail -c 900 "$LOG")"
  curl -X POST \
       -H "Accept: application/json" \
       -d "tag=kopia,backup-error" \
       -d "type=failure" \
       --data-urlencode "title=Kopia backup failed" \
       --data-urlencode "body=$body" \
       --silent \
       --output /dev/null \
       --retry 3 \
       --max-time 10 \
       "$APPRISE_URL" || echo "Failed to notify apprise"
}

LOG=/tmp/kopia-run.log

# Output still goes to stdout (kubectl logs) while being saved for the notification.
# pipefail makes rc the command's exit code instead of tee's.
set +e
{ setup && "$@"; } 2>&1 | tee "$LOG"
rc=$?
set -e

[ "$rc" -ne 0 ] && notify_failure "$rc"
exit "$rc"
