docker build --rm -t wallet-monitor ../

docker run\
    -e TATA="TOTO" \
    --rm \
    wallet-monitor