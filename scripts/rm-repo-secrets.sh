#!/bin/bash

if ! [ -n `which java` ]; then
  echo "Java is needed to run bfg"
  exit 1
fi

if ! [ -f bfg.jar ]; then
  curl https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar -o bfg.jar 
fi

echo "regex:.*" > replace.txt

java -jar bfg.jar -fi '*.{key,env}' -rt replace.txt --no-blob-protection
java -jar bfg.jar -fi '*secret.{json,conf,yaml}' -rt replace.txt --no-blob-protection

rm bfg.jar replace.txt
