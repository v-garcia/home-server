ARG WSTUNNEL_VERSION=v10.5.5

FROM alpine:3.24 AS fetch

ARG WSTUNNEL_VERSION
ARG TARGETARCH

RUN apk add --no-cache curl tar \
    && case "${TARGETARCH}" in \
        amd64) WSTUNNEL_ARCH=linux_amd64 ;; \
        arm64) WSTUNNEL_ARCH=linux_arm64 ;; \
        arm) WSTUNNEL_ARCH=linux_armv7 ;; \
        386) WSTUNNEL_ARCH=linux_386 ;; \
        *) echo "unsupported TARGETARCH: ${TARGETARCH}" >&2; exit 1 ;; \
    esac \
    && VERSION="${WSTUNNEL_VERSION#v}" \
    && curl -fsSL -o /tmp/wstunnel.tar.gz \
        "https://github.com/erebe/wstunnel/releases/download/${WSTUNNEL_VERSION}/wstunnel_${VERSION}_${WSTUNNEL_ARCH}.tar.gz" \
    && tar -xzf /tmp/wstunnel.tar.gz -C /usr/local/bin wstunnel \
    && chmod +x /usr/local/bin/wstunnel

FROM alpine:3.24

RUN apk add --no-cache ca-certificates

COPY --from=fetch /usr/local/bin/wstunnel /usr/local/bin/wstunnel

EXPOSE 8080

ENV RUST_LOG=info

ENTRYPOINT ["wstunnel", "server", "ws://0.0.0.0:8080"]
