FROM ekidd/rust-musl-builder:latest as build

RUN cargo install simple-http-server

RUN ls -la ~

FROM scratch

COPY --from=build \
    /home/rust/.cargo/bin/simple-http-server  \
    /usr/local/bin/simple-http-server

ENTRYPOINT ["simple-http-server"]

