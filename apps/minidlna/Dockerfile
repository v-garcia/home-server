FROM alpine:3.16

RUN apk add --no-cache minidlna tini

ENTRYPOINT ["/sbin/tini", "--"]

#CMD ["minidlnad" "--help"]
CMD ["/usr/sbin/minidlnad", "-d"]
#CMD ["sleep", "2h"]