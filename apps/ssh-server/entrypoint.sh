#!/bin/sh
set -e

AUTHORIZED_KEYS_SRC="${AUTHORIZED_KEYS_SRC:-/secrets/authorized_keys}"
PASSWORD_SRC="${PASSWORD_SRC:-/secrets/password}"

if [ ! -s "$AUTHORIZED_KEYS_SRC" ] && [ ! -s "$PASSWORD_SRC" ]; then
  echo "authorized_keys or password must be set in ssh-server-secret"
  exit 1
fi

if [ -s "$AUTHORIZED_KEYS_SRC" ]; then
  cp "$AUTHORIZED_KEYS_SRC" /home/ssh/.ssh/authorized_keys
  chmod 600 /home/ssh/.ssh/authorized_keys
  chown ssh:ssh /home/ssh/.ssh/authorized_keys
fi

if [ -s "$PASSWORD_SRC" ]; then
  printf 'ssh:%s' "$(tr -d '\n\r' < "$PASSWORD_SRC")" | chpasswd
fi

exec /usr/sbin/sshd -D -e
