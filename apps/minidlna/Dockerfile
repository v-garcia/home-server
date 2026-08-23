FROM alpine:3.23.5

RUN apk add --no-cache minidlna tini

ENTRYPOINT ["/sbin/tini", "--"]

#CMD ["minidlnad" "--help"]
CMD ["/usr/sbin/minidlnad", "-d"]
#CMD ["sleep", "2h"]