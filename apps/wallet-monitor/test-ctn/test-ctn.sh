docker build --rm -t wallet-monitor ../

source ./../.env

docker run\
    -e ALPHAVANTAGE_API_KEY="$ALPHAVANTAGE_API_KEY" \
    -e COUCHBASE_URL="$COUCHBASE_URL" \
    -e GOTIFY_URL="$GOTIFY_URL" \
    -e GOTIFY_TOKEN="$GOTIFY_TOKEN" \
    --rm \
    wallet-monitor 
