FROM node:lts-alpine3.18

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk update && apk upgrade && \
    apk add --no-cache git && \
    npm install

COPY ./src .

ENTRYPOINT [ "node",  "index.js" ]