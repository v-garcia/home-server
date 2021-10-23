FROM alpine:3.14.1 as builder

RUN apk add --no-cache \
    nodejs \
    npm

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /opt/

# Get dependencies

COPY package*.json ./

RUN npm install

COPY src ./src

FROM alpine:3.14.1

# Installs latest Chromium (89) package.

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app

COPY --from=builder /opt/ ./

CMD ["node", "src/index.js"]