# FROM nginx:1.19.2-alpine
FROM alpine:3.14

RUN apk update && apk add --no-cache nginx-mod-http-fancyindex

CMD ["nginx", "-g", "daemon off;"]