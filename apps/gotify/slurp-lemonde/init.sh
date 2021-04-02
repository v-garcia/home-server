#!/bin/bash

echo "download singleFile"

mkdir -p assets
cd assets

wget https://github.com/gildas-lormeau/SingleFile/archive/master.zip -O master.zip

unzip -q -o master.zip
rm master.zip
cd SingleFile-master/cli
