#!/bin/sh
set -e

AUTHORIZED_KEYS_SRC="${AUTHORIZED_KEYS_SRC:-/secrets/authorized_keys}"

if [ ! -s "$AUTHORIZED_KEYS_SRC" ]; then
  echo "authorized_keys must be set in ssh-server-secret"
  exit 1
fi

cp "$AUTHORIZED_KEYS_SRC" /home/ssh/.ssh/authorized_keys
chmod 600 /home/ssh/.ssh/authorized_keys
chown ssh:ssh /home/ssh/.ssh/authorized_keys

echo "loaded $(wc -l < /home/ssh/.ssh/authorized_keys) authorized key(s)"
echo "authorizedkeysfile $(/usr/sbin/sshd -T | awk '/^authorizedkeysfile /{print $2}')"

exec /usr/sbin/sshd -D -e
