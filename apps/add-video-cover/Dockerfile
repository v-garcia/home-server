
FROM golang:alpine3.12 as go-builder

ENV GO111MODULE=on

WORKDIR /app

COPY ./go.* /cmd/add-video-cover/* ./

RUN CGO_ENABLED=0  GOOS=linux GOARCH=amd64 go build -o add-video-cover .


FROM scratch

WORKDIR /app/

COPY --from=go-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=go-builder /app/add-video-cover /app/

ENTRYPOINT ["/app/add-video-cover"]