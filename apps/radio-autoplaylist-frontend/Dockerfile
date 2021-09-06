
FROM golang:alpine3.14 as go-builder

WORKDIR /app

COPY go.*  main.go ./
COPY src ./src 

RUN CGO_ENABLED=0  GOOS=linux GOARCH=amd64 GO111MODULE=on go build -o radio-autoplaylist-frontend .

FROM golang:alpine3.14

WORKDIR /app

COPY --from=go-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=go-builder /app/radio-autoplaylist-frontend  ./
COPY ./static ./static
COPY ./templates ./templates

ENTRYPOINT ["/app/radio-autoplaylist-frontend"]
