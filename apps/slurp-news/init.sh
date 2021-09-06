#!/bin/bash


SINGLE_FILE_VERSION="19cfe6b2956853b0ea0344e001da44aa7a151ada"

echo "downloading singleFile"

mkdir -p assets
cd assets

wget https://github.com/gildas-lormeau/SingleFile/archive/$SINGLE_FILE_VERSION.zip -O master.zip

unzip -q -o master.zip
mv "SingleFile-${SINGLE_FILE_VERSION}" SingleFile-master
rm master.zip
cd SingleFile-master/cli