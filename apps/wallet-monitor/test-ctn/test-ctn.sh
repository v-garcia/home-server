docker build --rm -t wallet-monitor ../

source ./../.env

docker run\
    -e ALPHAVANTAGE_API_KEY="$ALPHAVANTAGE_API_KEY" \
    -e WALLET_PATH="/wallet.edn" \
    -e GOTIFY_URL="$GOTIFY_URL" \
    -e GOTIFY_TOKEN="$GOTIFY_TOKEN" \
    -v $(pwd)/../wallet.edn:/wallet.edn \
    --rm \
    wallet-monitor 
