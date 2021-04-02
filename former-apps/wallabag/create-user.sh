#!/bin/sh

cd /var/www/wallabag/bin;

if [ -z "$ADMIN_PWD" ]
then
    echo "Password env var is not set"
    exit 1
fi


# Deactivate wallabag user
./console fos:user:deactivate wallabag  -e prodc

# Create prod user
./console fos:user:create admin admin@void.com "$ADMIN_PWD" --super-admin -e prod > /dev/null 2>&1 ;

# Echo command result
echo "Admin user creation code: $?"