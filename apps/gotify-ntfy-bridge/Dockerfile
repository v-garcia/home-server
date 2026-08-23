FROM babashka/babashka:1.3.191-alpine

WORKDIR /app

COPY ./run.clj ./

ENTRYPOINT ["bb"]
CMD  ["/app/run.clj"]