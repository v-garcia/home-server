#!/bin/bash

# awk -F: '{printf "%s:%s\n",$1,$3}' /etc/passwd

# creating dirs
sudo mkdir -p /data/ctorrent/
sudo mkdir -p /data/jdownloader/
sudo mkdir -p /data/sabnzbd/
sudo mkdir -p /data/config/
sudo mkdir -p /data/workdir/
sudo mkdir -p /data/perso/
sudo mkdir -p /data/public/
sudo mkdir -p /data/filebrowser/
sudo mkdir -p /data/rclone-perso/
sudo mkdir -p /data/supysonic/
sudo mkdir -p /data/gotify/

# deploy-ctn-app () {
#   echo "Deploying app: $1"
#   docker build ./apps/$1 -t 127.0.0.1:32000/$1
#   docker push 127.0.0.1:32000/$1
#   kustomize build ./apps/$1 --load_restrictor none | kubectl apply -f -
# }


# docker system prune -af

# kubectl patch pvc PVC_NAME -p '{"metadata":{"finalizers": []}}' --type=merge

#apply config
echo "Applying global manifests"
kustomize build ./global/ --load_restrictor none | kubectl apply -f -

#ddns-updater
docker build ./apps/ddns-updater -t 127.0.0.1:32000/ddns-updater
docker push 127.0.0.1:32000/ddns-updater
kustomize build ./apps/ddns-updater --load_restrictor none | kubectl apply -f -

#http-server
docker build ./apps/http-server -t 127.0.0.1:32000/http-server
docker push 127.0.0.1:32000/http-server
kustomize build ./apps/http-server --load_restrictor none | kubectl apply -f -

#sabnzbd
docker build ./apps/sabnzbd -t 127.0.0.1:32000/sabnzbd
docker push 127.0.0.1:32000/sabnzbd
kustomize build ./apps/sabnzbd --load_restrictor none | kubectl apply -f -

#cloudtorrent
docker build ./apps/cloudtorrent -t 127.0.0.1:32000/cloudtorrent
docker push 127.0.0.1:32000/cloudtorrent
kustomize build ./apps/cloudtorrent --load_restrictor none | kubectl apply -f -

#jdownloader
docker build ./apps/jdownloader -t 127.0.0.1:32000/jdownloader
docker push 127.0.0.1:32000/jdownloader
kustomize build ./apps/jdownloader --load_restrictor none | kubectl apply -f -

#rclone-perso
docker build ./apps/rclone-perso -t 127.0.0.1:32000/rclone-perso
docker push 127.0.0.1:32000/rclone-perso
kustomize build ./apps/rclone-perso --load_restrictor none | kubectl apply -f -

#gmusicuploader
docker build ./apps/gmusicuploader -t 127.0.0.1:32000/gmusicuploader
docker push 127.0.0.1:32000/gmusicuploader
kustomize build ./apps/gmusicuploader --load_restrictor none | kubectl apply -f -

#supysonic
docker build ./apps/supysonic -t 127.0.0.1:32000/supysonic
docker push 127.0.0.1:32000/supysonic
kustomize build ./apps/supysonic --load_restrictor none | kubectl apply -f -

#samba
docker build ./apps/samba -t 127.0.0.1:32000/samba
docker push 127.0.0.1:32000/samba
kustomize build ./apps/samba --load_restrictor none | kubectl apply -f -

#minidlna
docker build ./apps/minidlna -t 127.0.0.1:32000/minidlna
docker push 127.0.0.1:32000/minidlna
kustomize build ./apps/minidlna --load_restrictor none | kubectl apply -f -

#filebrowser
docker build ./apps/filebrowser -t 127.0.0.1:32000/filebrowser
docker push 127.0.0.1:32000/filebrowser
kustomize build ./apps/filebrowser --load_restrictor none | kubectl apply -f -

#gotify
docker build ./apps/gotify -t 127.0.0.1:32000/gotify
docker push 127.0.0.1:32000/gotify
kustomize build ./apps/gotify --load_restrictor none | kubectl apply -f -

#enedis-tracker
docker build ./apps/enedis-tracker -t 127.0.0.1:32000/enedis-tracker
docker push 127.0.0.1:32000/enedis-tracker
kustomize build ./apps/enedis-tracker --load_restrictor none | kubectl apply -f -

#upload
docker build ./apps/upload -t 127.0.0.1:32000/upload
docker push 127.0.0.1:32000/upload
kustomize build ./apps/upload --load_restrictor none | kubectl apply -f -