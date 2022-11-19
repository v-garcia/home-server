# install packages
pip install -r requirements.txt

# setup venv
virtualenv ./env

# switching to venv

source env/bin/activate

# quit venv

deactivate

# record deps

pip freeze > requirements.txt

# start repl 
cd src && source ../.env && python3
exec(open("app.py").read())

# reload module
import importlib
importlib.reload(s3_store)
exec(open("app.py").read())

# tests
python -m unittest discover tests

# resources

https://github.com/pypa/sampleproject