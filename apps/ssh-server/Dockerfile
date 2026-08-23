FROM alpine:3.24

RUN apk add --no-cache openssh shadow \
    && ssh-keygen -A \
    && adduser -D -s /bin/ash ssh \
    && passwd -d ssh \
    && mkdir -p /home/ssh/.ssh /etc/ssh/sshd_config.d \
    && chmod 700 /home/ssh/.ssh \
    && chown -R ssh:ssh /home/ssh \
    && printf '%s\n' 'AuthorizedKeysFile .ssh/authorized_keys' \
        > /etc/ssh/sshd_config.d/98-pubkey.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 22

CMD ["/entrypoint.sh"]
