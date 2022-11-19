FROM python:alpine3.15

WORKDIR /app

RUN apk update && apk add --no-cache gnupg

# install and store the requirements (this stage will be re-used unless requirements.txt changes)
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src src

ENTRYPOINT ["python","-u","src/app.py"]