#!/bin/bash

# awk -F: '{printf "%s:%s\n",$1,$3}' /etc/passwd

# copying transformers
pip install pyyaml
./scripts/cp-tranformers-to-plugin-dir.sh

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
sudo mkdir -p /data/vaultwarden/
sudo mkdir -p /data/heimdall/
sudo mkdir -p /data/slurp-lemonde/
sudo mkdir -p /data/navidrome
sudo mkdir -p /data/yarr
sudo mkdir -p /data/slurp-news
sudo mkdir -p /data/radio-autoplaylist
sudo mkdir -p /data/home-assistant
sudo mkdir -p /data/influxdb
sudo mkdir -p /data/mosquitto
sudo mkdir -p /data/zigbee2mqtt

# cert-manager
# https://cert-manager.io/docs/installation/kubernetes/
# https://cert-manager.io/docs/installation/upgrading/
# https://github.com/jetstack/cert-manager/issues/2451#issuecomment-583333899

kubectl create namespace cert-manager
kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.9.1/cert-manager.yaml


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
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.6.0/aio/deploy/alternative.yaml
./apps/dashboard/gen-resources.sh | kubectl apply -f -

#ddns-updater
docker build ./apps/ddns-updater -t localhost:32000/ddns-updater && \
docker push localhost:32000/ddns-updater && \
kustomize build ./apps/ddns-updater --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#http-server
docker build ./apps/http-server -t localhost:32000/http-server && \
docker push localhost:32000/http-server && \
kustomize build ./apps/http-server --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#sabnzbd
docker build ./apps/sabnzbd -t localhost:32000/sabnzbd && \
docker push localhost:32000/sabnzbd && \
kustomize build ./apps/sabnzbd --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#rclone-perso
docker build ./apps/rclone-perso -t localhost:32000/rclone-perso && \
docker push localhost:32000/rclone-perso && \
kustomize build ./apps/rclone-perso --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#navidrome
docker build ./apps/navidrome -t localhost:32000/navidrome && \
docker push localhost:32000/navidrome && \
kustomize build ./apps/navidrome --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#samba
docker build ./apps/samba -t localhost:32000/samba && \
docker push localhost:32000/samba && \
kustomize build ./apps/samba --load-restrictor LoadRestrictionsNone | kubectl apply -f -  && \
./apps/samba/patch-ingress.sh # redirect samba ports in ingress

#minidlna
docker build ./apps/minidlna -t localhost:32000/minidlna && \
docker push localhost:32000/minidlna && \
kustomize build ./apps/minidlna --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#filebrowser
docker build ./apps/filebrowser -t localhost:32000/filebrowser && \
docker push localhost:32000/filebrowser && \
kustomize build ./apps/filebrowser --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#gotify
docker build ./apps/gotify -t localhost:32000/gotify && \
docker push localhost:32000/gotify && \
kustomize build ./apps/gotify --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#upload
docker build ./apps/upload -t localhost:32000/upload
docker push localhost:32000/upload
kustomize build ./apps/upload --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#wallet-monitor
docker build ./apps/wallet-monitor -t localhost:32000/wallet-monitor && \
docker push localhost:32000/wallet-monitor && \
kustomize build ./apps/wallet-monitor --load-restrictor LoadRestrictionsNone  | kubectl apply -f -

#torrent-ratio
docker build ./apps/torrent-ratio -t localhost:32000/torrent-ratio
docker push localhost:32000/torrent-ratio
kustomize build ./apps/torrent-ratio --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#aria2
docker build ./apps/aria2 -t localhost:32000/aria2 && \
docker push localhost:32000/aria2 && \
kustomize build ./apps/aria2 --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#heimdall
docker build ./apps/heimdall -t localhost:32000/heimdall && \
docker push localhost:32000/heimdall && \
kustomize build ./apps/heimdall --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#add-video-cover
docker build ./apps/add-video-cover -t localhost:32000/add-video-cover && \
docker push localhost:32000/add-video-cover && \
kustomize build ./apps/add-video-cover --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#yarr
docker build ./apps/yarr -t localhost:32000/yarr
docker push localhost:32000/yarr
kustomize build ./apps/yarr --load-restrictor LoadRestrictionsNone  --enable-alpha-plugins | kubectl apply -f -

#slurp-news
docker build ./apps/slurp-news -t localhost:32000/slurp-news && \
docker push localhost:32000/slurp-news && \
kustomize build ./apps/slurp-news --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#radio-autoplaylist
docker build ./apps/radio-autoplaylist -t localhost:32000/radio-autoplaylist && \
docker push localhost:32000/radio-autoplaylist && \
kustomize build ./apps/radio-autoplaylist --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#enedis-tracker
docker build ./apps/enedis-tracker -t localhost:32000/enedis-tracker && \
docker push localhost:32000/enedis-tracker && \
kustomize build ./apps/enedis-tracker --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#boursorama-tracker
docker build ./apps/boursorama-tracker -t localhost:32000/boursorama-tracker && \
docker push localhost:32000/boursorama-tracker && \
kustomize build ./apps/boursorama-tracker --load-restrictor LoadRestrictionsNone | kubectl apply -f -

#radio-autoplaylist-frontend
docker build ./apps/radio-autoplaylist-frontend -t localhost:32000/radio-autoplaylist-frontend && \
docker push localhost:32000/radio-autoplaylist-frontend && \
kustomize build ./apps/radio-autoplaylist-frontend --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#edith
docker build ./apps/edith -t localhost:32000/edith && \
docker push localhost:32000/edith && \
kustomize build ./apps/edith --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#vaultwarden
docker build ./apps/vaultwarden -t localhost:32000/vaultwarden && \
docker push localhost:32000/vaultwarden && \
kustomize build ./apps/vaultwarden --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#home-assistant
docker build ./apps/home-assistant -t localhost:32000/home-assistant && \
docker push localhost:32000/home-assistant && \
kustomize build ./apps/home-assistant --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#netcheck
docker build ./apps/netcheck -t localhost:32000/netcheck && \
docker push localhost:32000/netcheck && \
kustomize build ./apps/netcheck --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#influxdb
docker build ./apps/influxdb -t localhost:32000/influxdb && \
docker push localhost:32000/influxdb && \
kustomize build ./apps/influxdb --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#telegraf
docker build ./apps/telegraf -t localhost:32000/telegraf && \
docker push localhost:32000/telegraf && \
kustomize build ./apps/telegraf --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#s3-to-influxdb
docker build ./apps/s3-to-influxdb -t localhost:32000/s3-to-influxdb && \
docker push localhost:32000/s3-to-influxdb && \
kustomize build ./apps/s3-to-influxdb --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#woob-extractor
docker build ./apps/woob-extractor -t localhost:32000/woob-extractor && \
docker push localhost:32000/woob-extractor && \
kustomize build ./apps/woob-extractor --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#mosquitto
docker build ./apps/mosquitto -t localhost:32000/mosquitto && \
docker push localhost:32000/mosquitto && \
kustomize build ./apps/mosquitto --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -

#zigbee2mqtt
docker build ./apps/zigbee2mqtt -t localhost:32000/zigbee2mqtt && \
docker push localhost:32000/zigbee2mqtt && \
kustomize build ./apps/zigbee2mqtt --load-restrictor LoadRestrictionsNone --enable-alpha-plugins | kubectl apply -f -