FROM oracle/graalvm-ce:19.3.1-java11 as builder

RUN gu install native-image
ENV GRAALVM_HOME=$JAVA_HOME

RUN curl -O https://download.clojure.org/install/linux-install-1.10.1.502.sh
RUN chmod +x linux-install-1.10.1.502.sh
RUN ./linux-install-1.10.1.502.sh

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY deps.edn .
RUN clojure -R:native-image
COPY . .

RUN clojure -A:native-image

RUN chmod +x wallet-monitor


FROM frolvlad/alpine-glibc:alpine-3.9_glibc-2.29 as wallet-monitor

COPY --from=builder /usr/src/app/wallet-monitor  /usr/local/bin/wallet-monitor

ENTRYPOINT ["wallet-monitor"]