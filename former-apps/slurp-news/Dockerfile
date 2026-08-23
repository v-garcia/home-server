FROM alpine:3.12.1 as web-builder

RUN apk add --no-cache \
    nodejs \
    yarn

WORKDIR /opt/

# Get dependencies

COPY client/package.json client/yarn.lock ./

RUN yarn install

# Build the application

COPY client ./
RUN yarn run parcel build ./src/index.html 

FROM alpine:3.12.1

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

COPY package.json yarn.lock init.sh ./

# Puppeteer v1.19.0 works with Chromium 77.

RUN apk update && apk upgrade && \
    apk add --no-cache git && \
    yarn install

COPY ./src ./src

COPY --from=web-builder /opt/dist ./static

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "src/index.js"]