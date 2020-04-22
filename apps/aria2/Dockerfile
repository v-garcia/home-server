FROM redwid/aria2-ng:1.1.4

# https://registry.hub.docker.com/r/redwid/aria2-ng
# https://github.com/Redwid/docker-aria2-ng

ADD ./scripts/on-dl-finish.sh /usr/bin/on-dl-finish
RUN chmod +x /usr/bin/on-dl-finish

ADD ./scripts/set-defaults.js /aria2-ng/js/set-defaults.js
RUN sed -i.back 's~<head[^>]*>~&<script type="text/javascript" src="js/set-defaults.js"></script>~' /aria2-ng/index.html