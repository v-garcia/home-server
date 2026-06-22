FROM alpine:3.24

RUN apk add --no-cache openssh shadow \
    && ssh-keygen -A \
    && adduser -D -s /bin/ash ssh \
    && mkdir -p /home/ssh/.ssh /etc/ssh/sshd_config.d \
    && chmod 700 /home/ssh/.ssh \
    && chown -R ssh:ssh /home/ssh \
    && mkdir -p /secrets

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 22

CMD ["/entrypoint.sh"]
