FROM oracle/graalvm-ce:19.3.1-java11 as builder

RUN gu install native-image
RUN yum install -y libstdc++-static
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

RUN chmod +x wallet-monitor && \
    du -h wallet-monitor

# FROM xfournet/jready:alpine as wallet-monitor
FROM frolvlad/alpine-glibc as wallet-monitor

# https://github.com/oracle/graal/issues/1891
RUN apk add --no-cache libstdc++

COPY --from=builder /usr/src/app/wallet-monitor  /usr/local/bin/wallet-monitor

ENTRYPOINT ["wallet-monitor"]