FROM alpine:edge

# Installs latest Chromium (77) package.
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn \
    tini

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app

COPY package*.json init.sh ./

# # Puppeteer v1.19.0 works with Chromium 77.

RUN apk update && apk upgrade && \
    apk add --no-cache git && \
    yarn install

COPY ./src ./src
COPY ./static ./static

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "src/index.js"]