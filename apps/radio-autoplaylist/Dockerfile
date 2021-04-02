FROM node:15.12-alpine3.13

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./src ./src

ENTRYPOINT [ "node",  "src/index.js" ]