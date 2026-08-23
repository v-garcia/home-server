#!/bin/bash

set -o allexport
source .env
set +o allexport

export FLUX_DIR=./data/

bb --nrepl-server 1667