#!/bin/bash

# awk -F: '{printf "%s:%s\n",$1,$3}' /etc/passwd

# creating dirs
sudo mkdir -p /data/perso/
sudo mkdir -p /data/public/

sudo mkdir -p /data/sabnzbd/
sudo mkdir -p /data/config/
sudo mkdir -p /data/workdir/
sudo mkdir -p /data/filebrowser/
sudo mkdir -p /data/rclone-perso/
sudo mkdir -p /data/gotify/
sudo mkdir -p /data/minidlna/
sudo mkdir -p /data/aria2/
sudo mkdir -p /data/heimdall/
sudo mkdir -p /data/slurp-lemonde/
sudo mkdir -p /data/navidrome
sudo mkdir -p /data/yarr
sudo mkdir -p /data/slurp-news
sudo mkdir -p /data/radio-autoplaylist


# cert-manager
# https://cert-manager.io/docs/installation/kubernetes/
# https://cert-manager.io/docs/installation/upgrading/
# https://github.com/jetstack/cert-manager/issues/2451#issuecomment-583333899

kubectl create namespace cert-manager
kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.5.3/cert-manager.yaml


# deploy-ctn-app () {
#   echo "Deploying app: $1"
#   docker build ./apps/$1 -t localhost:32000/$1
#   docker push localhost:32000/$1
#   kustomize build ./apps/$1 --load-restrictor LoadRestrictionsNone | kubectl apply -f -
# }

## Common commands

# kubectl exec -it shell-demo -- /bin/bash

# docker system prune -af

# https://github.com/kubernetes/kubernetes/issues/60807#issuecomment-572615776
# kubectl patch pvc PVC_NAME -p '{"metadata":{"finalizers": []}}' --type=merge

# kubectl create job --from=cronjob/<cronjob-name> <job-name>

# kubectl port-forward -n kube-system service/kubernetes-dashboard 10443:443

#make tcp ports configurable
./scripts/custom-k8s-ingress.sh 

#apply config
echo "Applying global manifests"
kustomize build ./global/ --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#dashboard
# uses alternative setup https://github.com/kubernetes/dashboard/blob/master/docs/user/installation.md#alternative-setup
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.3.1/aio/deploy/alternative.yaml
./apps/dashboard/gen-resources.sh | kubectl apply -f -

#ddns-updater
docker build ./apps/ddns-updater -t localhost:32000/ddns-updater
docker push localhost:32000/ddns-updater
kustomize build ./apps/ddns-updater --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#http-server
docker build ./apps/http-server -t localhost:32000/http-server
docker push localhost:32000/http-server
kustomize build ./apps/http-server --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#sabnzbd
docker build ./apps/sabnzbd -t localhost:32000/sabnzbd
docker push localhost:32000/sabnzbd
kustomize build ./apps/sabnzbd --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#rclone-perso
docker build ./apps/rclone-perso -t localhost:32000/rclone-perso
docker push localhost:32000/rclone-perso
kustomize build ./apps/rclone-perso --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#navidrome
docker build ./apps/navidrome -t localhost:32000/navidrome
docker push localhost:32000/navidrome
kustomize build ./apps/navidrome --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#samba
docker build ./apps/samba -t localhost:32000/samba
docker push localhost:32000/samba
kustomize build ./apps/samba --load-restrictor LoadRestrictionsNone | kubectl apply -f -
./apps/samba/patch-ingress.sh # redirect samba ports in ingress

#minidlna
docker build ./apps/minidlna -t localhost:32000/minidlna
docker push localhost:32000/minidlna
kustomize build ./apps/minidlna --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#filebrowser
docker build ./apps/filebrowser -t localhost:32000/filebrowser
docker push localhost:32000/filebrowser
kustomize build ./apps/filebrowser --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#gotify
docker build ./apps/gotify -t localhost:32000/gotify
docker push localhost:32000/gotify
kustomize build ./apps/gotify --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#upload
docker build ./apps/upload -t localhost:32000/upload
docker push localhost:32000/upload
kustomize build ./apps/upload --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#wallet-monitor
docker build ./apps/wallet-monitor -t localhost:32000/wallet-monitor
docker push localhost:32000/wallet-monitor
kustomize build ./apps/wallet-monitor --load-restrictor LoadRestrictionsNone  | kubectl apply -f -

#torrent-ratio
docker build ./apps/torrent-ratio -t localhost:32000/torrent-ratio
docker push localhost:32000/torrent-ratio
kustomize build ./apps/torrent-ratio --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#aria2
docker build ./apps/aria2 -t localhost:32000/aria2
docker push localhost:32000/aria2
kustomize build ./apps/aria2 --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#heimdall
docker build ./apps/heimdall -t localhost:32000/heimdall
docker push localhost:32000/heimdall
kustomize build ./apps/heimdall --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#add-video-cover
docker build ./apps/add-video-cover -t localhost:32000/add-video-cover
docker push localhost:32000/add-video-cover
kustomize build ./apps/add-video-cover --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#yarr
docker build ./apps/yarr -t localhost:32000/yarr
docker push localhost:32000/yarr
kustomize build ./apps/yarr --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#slurp-news
docker build ./apps/slurp-news -t localhost:32000/slurp-news
docker push localhost:32000/slurp-news
kustomize build ./apps/slurp-news --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#radio-autoplaylist
docker build ./apps/radio-autoplaylist -t localhost:32000/radio-autoplaylist
docker push localhost:32000/radio-autoplaylist
kustomize build ./apps/radio-autoplaylist --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#enedis-tracker
docker build ./apps/enedis-tracker -t localhost:32000/enedis-tracker
docker push localhost:32000/enedis-tracker
kustomize build ./apps/enedis-tracker --load-restrictor LoadRestrictionsNone | kubectl apply -f -