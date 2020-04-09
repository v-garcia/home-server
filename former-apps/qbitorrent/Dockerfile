FROM linuxserver/qbittorrent:amd64-14.2.2.99202003250005-6939-3c17ad5ubuntu18.04.1-ls66
# https://hub.docker.com/r/linuxserver/qbittorrent/tags
# https://github.com/linuxserver/docker-qbittorrent

ADD ./notify-finished.sh /usr/bin/notify-finished
RUN chmod +x /usr/bin/notify-finished