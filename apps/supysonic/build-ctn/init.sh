#!/bin/sh

# create config
cat > /etc/supysonic <<EOF
[base]
database_uri = sqlite:////var/lib/supysonic/supysonic.db
EOF

# create user
adduser -D -u $UID -g $GID -h /var/lib/supysonic supysonic

if ! test -f /var/lib/supysonic/supysonic.db; then
    # create database if required
    echo Creating intial database
    pip install /supysonic-master

    if test -f /run/secrets/supysonic; then
        password=$(cat /run/secrets/supysonic)
    else
        until [ ${len=0} -gt 12 ]; do len=$(( $RANDOM % 24 )); done
        password=$(tr -dc '[:alnum:]' < /dev/urandom | head -c $len)
        echo Generated password: $password
    fi

    echo Adding user
    supysonic-cli user add admin -a -p $password

    echo Adding and scanning Library in /media
    supysonic-cli folder add Library /media
    # supysonic-cli folder scan Library

    echo Changing owner of config dir
    chown -R supysonic:supysonic ~supysonic
else
    # update database
    # see: https://github.com/spl0k/supysonic/blob/master/README.md#upgrading
    pip install /supysonic-master
fi

# run watcher in background, if not disabled
# if [ "$RUN_WATCHER" == "true" ]; then
#     sudo -u supysonic -g supysonic sh -c "while sleep 1; do supysonic-watcher; done" &
# fi

# run uwsgi
exec uwsgi --http-socket :8080 \
           --wsgi-file /supysonic-master/cgi-bin/supysonic.wsgi \
           --master \
           --processes 4 --threads 2 \
           --uid $UID --gid $GID
