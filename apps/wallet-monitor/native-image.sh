#!/usr/bin/env bash

rm ./wallet-monitor
export GRAALVM_HOME="/usr/lib/jvm/graalvm/bin"
clj -A:native-image