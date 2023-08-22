FROM babashka/babashka:1.3.183-alpine

WORKDIR /app

COPY ./run.clj ./

ENTRYPOINT ["bb"]
CMD  ["/app/run.clj"]