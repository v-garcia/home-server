FROM node:alpine3.11 as web-builder

# Target dir
RUN mkdir -p /app
WORKDIR /app

# Bundle Deps

COPY web/package*.json .
RUN npm install

# Build the application
COPY web/index.html web/favicon.png web/.postcssrc ./
ENV NODE_ENV production
RUN npm run build

FROM golang:alpine3.11 as go-builder


FROM scratch
WORKDIR /root/