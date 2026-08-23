FROM golang:alpine AS build


ARG YARR_HASH="46d8c98aff049b2ecc3b617c2b3612023f01bce4"

WORKDIR /src

RUN apk add build-base git && \
  git clone https://github.com/nkanaev/yarr.git . && \
  git checkout $YARR_HASH

COPY custom-js/* ./assets/javascripts

# Add custom script to html index && remove targeting to custom gofeed
RUN sed -i '/<\/body>/i <script src="./static/javascripts/addSlurpLink.js"></script>' assets/index.html && \
  sed -i '$ d' go.mod && \
  make build_linux 

FROM alpine:latest
RUN apk add --no-cache ca-certificates && \
  update-ca-certificates && \
  mkdir /data
COPY --from=build /src/_output/linux/yarr /usr/local/bin/yarr
EXPOSE 7070
CMD ["/usr/local/bin/yarr", "-addr", "0.0.0.0:7070", "-db", "/data/yarr.db"]