FROM python:3.12-alpine

WORKDIR /app/

RUN apk add --no-cache git && \
      git clone --depth=1 https://github.com/v-garcia/Ratio.py ./ && \
      pip install -r requirements.txt
      
ENTRYPOINT "/bin/sh" \ 
           "-c" \
           'echo {\"torrent\":\"/t.torrent\", \"upload\":\"$UPLOAD_SPEED\"} >> c.json && cat c.json && python ratio.py -c c.json'
  
