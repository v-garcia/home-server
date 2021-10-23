FROM alpine:3.14.1 as builder


ARG GIT_HASH="9289acc24c1f22ad39988e045c4a68f02de8bbd7"

WORKDIR /opt

RUN apk add git && \
  git clone https://github.com/sunny/edith . && \
  git checkout $GIT_HASH

RUN ls -R


FROM php:7.4-apache

WORKDIR /app

COPY --from=builder /opt/docker_files/vhost.conf /etc/apache2/sites-available/000-default.conf
COPY --from=builder /opt/docker_files/apache.conf /etc/apache2/conf-available/z-app.conf
COPY --from=builder /opt/docker_files/php.ini /usr/local/etc/php/conf.d/app.ini
RUN a2enmod rewrite && a2enconf z-app
COPY --from=builder /opt/docker_files/errors /errors

COPY --from=builder /opt/index.php index.php
COPY --from=builder /opt/htaccess.example .htaccess
COPY --from=builder /opt/lib lib
COPY --from=builder /opt/public public
COPY --from=builder /opt/templates templates

RUN mkdir -p data && chown -R www-data data && chmod a+w /app/data

