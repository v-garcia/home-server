#!/bin/bash

# Wait until server respond
while ! nc -z localhost 8086 </dev/null; do sleep 10; done

influx bucket create -n my-data -r 0

exit 0