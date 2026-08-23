
Test stats endpoint
```
apk add curl && export TOKEN=$(cat /run/secrets/kubernetes.io/serviceaccount/token) && curl -i --insecure  https://$HOSTIP:10250/stats/summary --header "Authorization: Bearer $TOKEN"
```