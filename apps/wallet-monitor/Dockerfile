
FROM clojure:openjdk-11-tools-deps as builder
# clojure:openjdk-14-tools-deps

WORKDIR /opt

COPY . .

RUN set -e && \
    clojure -A:uberdeps -m "uberdeps.uberjar" --target wallet-monitor.jar

FROM openjdk:jre-alpine

WORKDIR /opt

COPY --from=builder /opt/wallet-monitor.jar .

ENTRYPOINT ["java", "-cp", "wallet-monitor.jar", "clojure.main", "-m", "wallet-monitor.core"]