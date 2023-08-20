FROM  babashka/babashka:1.3.182-alpine

RUN apk add --no-cache  openjdk11

WORKDIR /app

COPY ./bb.edn ./run.clj ./

ENTRYPOINT ["bb"]
CMD  ["/app/run.clj"]