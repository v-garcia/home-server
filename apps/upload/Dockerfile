FROM node:alpine3.11 as web-builder

# Target dir

WORKDIR /app/web/

# Bundle Deps

COPY web/package*.json ./
RUN npm install

# Build the application
COPY web/index.html web/favicon.png web/.postcssrc ./
COPY web/src/* ./src/

ENV NODE_ENV production
RUN npm run build

FROM golang:alpine3.11 as go-builder

# Install git
RUN apk update && apk add --no-cache git

WORKDIR /app/cmd/upload

# Build the Go app
COPY /cmd/upload/* ./
RUN go get -d -v
RUN CGO_ENABLED=0  GOOS=linux GOARCH=amd64 go build -o main .

# FROM alpine:3.9.5

FROM scratch

WORKDIR /app/

COPY --from=go-builder /app/cmd/upload/main ./cmd/upload/main

COPY --from=web-builder /app/web/dist/ ./web/dist

# # Expose port 8080 to the outside world
# EXPOSE 9001

ENTRYPOINT [ "/app/cmd/upload/main" ]
#ENTRYPOINT ["tail", "-f", "/dev/null"]