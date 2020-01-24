FROM python:alpine

ENV \
    UID=1000 \
    GID=1000 \
    RUN_WATCHER=true


ADD https://github.com/spl0k/supysonic/archive/master.zip /supysonic.zip
ADD init.sh /init.sh

RUN apk --no-cache add libjpeg-turbo sqlite zlib jpeg pcre sudo \
                       gcc musl-dev zlib-dev jpeg-dev pcre-dev linux-headers && \
    unzip supysonic.zip && \
    pip install uwsgi watchdog /supysonic-master && \
    rm supysonic.zip && \
    apk del gcc musl-dev zlib-dev jpeg-dev linux-headers pcre-dev && \
    rm -rf /var/cache/apk/*

VOLUME [ \
    "/media", \
    "/var/lib/supysonic" \
]

CMD "./init.sh"
