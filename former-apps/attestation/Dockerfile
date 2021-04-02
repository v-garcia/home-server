FROM alpine:edge as web-builder

RUN apk add --no-cache \
    nodejs npm

WORKDIR /usr/src/app/web

# Install deps
COPY web/package*.json  ./
RUN npm install

# Copy src
COPY web/ ./

# Build
RUN npm run build


FROM alpine:edge

RUN apk add --no-cache \
    nodejs npm tini

WORKDIR /usr/src/app/server

# Install deps
COPY server/package*.json ./
RUN npm install

COPY server/server.js ./server.js
COPY --from=web-builder /usr/src/app/web/dist /usr/src/app/web/dist


ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
