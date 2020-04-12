#!/bin/bash

sudo rm -rfv data downloads

mkdir -p data downloads

echo -e "*\n!.gitignore" | tee -a "data/.gitignore" "downloads/.gitignore" 