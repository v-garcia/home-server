#!/bin/bash

# awk -F: '{printf "%s:%s\n",$1,$3}' /etc/passwd

# creating dirs
sudo mkdir -p /data/perso/
sudo mkdir -p /data/public/
sudo mkdir -p /data/downloads/

sudo mkdir -p /data/jdownloader/
sudo mkdir -p /data/sabnzbd/
sudo mkdir -p /data/config/
sudo mkdir -p /data/workdir/
sudo mkdir -p /data/filebrowser/
sudo mkdir -p /data/rclone-perso/
sudo mkdir -p /data/supysonic/
sudo mkdir -p /data/gotify/
sudo mkdir -p /data/transmission/
sudo mkdir -p /data/gerbera/

# cert-manager
# https://cert-manager.io/docs/installation/kubernetes/
# https://cert-manager.io/docs/installation/upgrading/
# https://github.com/jetstack/cert-manager/issues/2451#issuecomment-583333899

kubectl create namespace cert-manager
kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.14.2/cert-manager.yaml

# deploy-ctn-app () {
#   echo "Deploying app: $1"
#   docker build ./apps/$1 -t 127.0.0.1:32000/$1
#   docker push 127.0.0.1:32000/$1
#   kustomize build ./apps/$1 --load_restrictor none | kubectl apply -f -
# }

## Common commands

# kubectl exec -it shell-demo -- /bin/bash

# docker system prune -af

# https://github.com/kubernetes/kubernetes/issues/60807#issuecomment-572615776
# kubectl patch pvc PVC_NAME -p '{"metadata":{"finalizers": []}}' --type=merge

# kubectl create job --from=cronjob/<cronjob-name> <job-name>

# kubectl port-forward -n kube-system service/kubernetes-dashboard 10443:443

#apply config
echo "Applying global manifests"
kustomize build ./global/ --load_restrictor none | kubectl apply -f -

#dashboard
# uses alternative setup https://github.com/kubernetes/dashboard/blob/master/docs/user/installation.md#alternative-setup
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0-rc6/aio/deploy/alternative.yaml
./apps/dashboard/gen-resources.sh | kubectl apply -f -

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

#gerbera
docker build ./apps/gerbera -t 127.0.0.1:32000/gerbera
docker push 127.0.0.1:32000/gerbera
kustomize build ./apps/gerbera --load_restrictor none | kubectl apply -f -

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

#wallet-monitor
docker build ./apps/wallet-monitor -t 127.0.0.1:32000/wallet-monitor
docker push 127.0.0.1:32000/wallet-monitor
kustomize build ./apps/wallet-monitor --load_restrictor none | kubectl apply -f -

#transmission
docker build ./apps/transmission -t 127.0.0.1:32000/transmission
docker push 127.0.0.1:32000/transmission
kustomize build ./apps/transmission --load_restrictor none | kubectl apply -f -

#torrent-ratio
docker build ./apps/torrent-ratio -t 127.0.0.1:32000/torrent-ratio
docker push 127.0.0.1:32000/torrent-ratio
kustomize build ./apps/torrent-ratio --load_restrictor none | kubectl apply -f -