FROM  linuxserver/transmission:amd64-2.94-r3-ls48

# https://hub.docker.com/r/linuxserver/transmission/tags
# https://github.com/linuxserver/docker-transmission/blob/master/Dockerfile

ADD ./notify-finished.sh /usr/bin/notify-finished
RUN chmod +x /usr/bin/notify-finished