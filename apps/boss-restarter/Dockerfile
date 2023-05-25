FROM babashka/babashka:1.3.179-alpine

RUN apk add --no-cache bash aws-cli

WORKDIR /app

COPY ./run.clj .

ENTRYPOINT ["bb"]
CMD  ["/app/run.clj"]