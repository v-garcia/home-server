# repo
git clone git@github.com:v-garcia/my-home-server.git

## secrets
install [transcrypt](https://github.com/elasticdog/transcrypt/blob/master/INSTALL.md)  
transcrypt -c aes-256-cbc -p 'my password'

# Docker
install docker  
sudo systemctl enable docker.service  
sudo usermod -aG docker ${USER}  
add to /etc/docker/daemon.json  
```
{
  "insecure-registries" : ["127.0.0.1:32000"]
}
```

# Snap
installer yay  
installer aur/snapd  
sudo systemctl enable snapd.socket --now  
sudo ln -s /var/lib/snapd/snap /snap  

# yq
snap install yq  

# microk8s
```
sudo snap install microk8s --classic
sudo usermod -a -G microk8s vincent  
sudo microk8s.enable metrics-server dns storage registry ingress  
microk8s.stop && microk8s.start  
sudo snap alias microk8s.kubectl kubectl  
sudo iptables -P FORWARD ACCEPT   
'' iptables-save -f /etc/iptables/iptables.rules  
```

## containrd
add to /var/snap/microk8s/current/args/containerd-template.toml  
[plugins.cri.registry.mirrors]
  [plugins.cri.registry.mirrors."docker.io"]
    endpoint = ["https://registry-1.docker.io"]
  [plugins.cri.registry.mirrors."local.insecure-registry.io"]
    endpoint = ["http://127.0.0.1:32000"]
  [plugins.cri.registry.mirrors."127.0.0.1:32000"]
    endpoint = ["http://127.0.0.1:32000"]


# Connect to dashboard

## Access dashboard
kubectl get services --all-namespaces  
http://localhost:8080/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login  

## Get token
microk8s.kubectl -n kube-system get secret  
microk8s.kubectl -n kube-system describe secret kubernetes-dashboard-token-xxxxx  

# Deploy

## Kustomize

Install kustomize  
https://github.com/kubernetes-sigs/kustomize/blob/master/docs/INSTALL.md  

## Overlays

Fill patch 'overlays/pv-node affinity' with the main node name  

## Deploy

Run deploy.sh  

# Issue help

## Node maintenance
See node managment info  
https://kubernetes.io/docs/tasks/administer-cluster/cluster-management/#maintenance-on-a-node  

## Trouve uninstalling micok8s
https://github.com/ubuntu/microk8s/issues/58#issuecomment-400647932
