#!/bin/bash
cd "$(dirname "$0")"

. ./.env

docker build --rm -t rqbit ../
docker build --rm -f ../notifier.Dockerfile -t rqbit-notifier ../

docker rm --force $(docker ps -aq --filter name=rqbit)

# Route to the real apprise instance, bound on the docker bridge so containers reach it via host.docker.internal
docker_gw=$(docker network inspect bridge -f '{{(index .IPAM.Config 0).Gateway}}')
kubectl port-forward --address "$docker_gw" service/apprise "$APPRISE_PORT:8000" &
pf_pid=$!

docker run \
    --detach \
    --rm \
    --name rqbit \
    --add-host=host.docker.internal:host-gateway \
    -p 3030:3030 \
    --env-file .env \
    -v $(pwd)/db/:/home/rqbit/db \
    -v $(pwd)/cache/:/home/rqbit/cache \
    -v $(pwd)/downloads/:/home/rqbit/downloads \
    -v $(pwd)/watchdir/:/home/rqbit/watchdir \
    rqbit \
    server start /home/rqbit/downloads \
    --watch-folder /home/rqbit/watchdir

# Shares rqbit network namespace (like a sidecar in the pod): rqbit is reachable on localhost
docker run \
    --detach \
    --rm \
    --name rqbit-notifier \
    --network container:rqbit \
    -e APPRISE_URL="$APPRISE_URL" \
    rqbit-notifier

# kubectl (microk8s) is a wrapper script: also kill its child
trap 'docker rm --force rqbit-notifier rqbit; pkill -P $pf_pid; kill $pf_pid' EXIT
docker logs -f rqbit-notifier &
docker logs -f rqbit


# docker exec -it rqbit bash
