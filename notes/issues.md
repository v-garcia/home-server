## Node maintenance
See node managment info  
https://kubernetes.io/docs/tasks/admi nister-cluster/cluster-management/#maintenance-on-a-node  

## Clean microK8S registry
https://gist.github.com/Kevinrob/4c7f1e5dbf6ce4e94d6ba2bfeff37aeb

## remove some images

microk8s ctr images ls | grep -i edith | while read line || [[ -n $line ]];
do
  microk8s ctr images rm $line
done;

## Trouve uninstalling microk8s
https://github.com/ubuntu/microk8s/issues/58#issuecomment-400647932

## CertManager

https://docs.cert-manager.io/en/release-0.7/reference/orders.html

## Logs

journalctl -u snap.microk8s.daemon-kubelet
kubectl logs -n ingress nginx-ingress-microk8s-controller-dq74p

# Past issues

## No internet in pods after update

- Check kubelet logs
- https://github.com/ubuntu/microk8s/issues/935#issuecomment-607227031

## Missing certificates

- microk8s refresh-certs

## Node had noschedule taint

sudo journalctl -u snap.microk8s.daemon-containerd | tail -n 50
sudo journalctl -u snap.microk8s.daemon-kubelet | tail -n 50

microk8s.stop
remove /var/snap/microk8s/common/var/lib/
microk8s.start

## Arch linux

cd /tmp && git clone 'https://aur.archlinux.org/yay.git' && cd /tmp/yay && makepkg -si && cd ~ && rm -rf /tmp/yay/