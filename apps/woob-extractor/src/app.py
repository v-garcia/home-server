from woob.core import Woob
from woob.capabilities.base import EmptyType, NotLoaded
from io import StringIO, BytesIO
import jmespath
import re
import sys
from operator import itemgetter
from datetime import date
import boto3
import os
import csv
from itertools import groupby
import yaml
import humps
import argparse
import traceback
import requests

w = Woob()

s3_client = boto3.client('s3',
                         region_name=os.getenv('AWS_REGION'),
                         endpoint_url=os.getenv('AWS_S3_ENDPOINT'))

constants = {"today_str": date.today().strftime("%Y%m%d")}

# Utils


def substitute(str, env=os.environ, constants=constants, **kwargs):
    return re.sub(r"\{(.+?)\}", lambda x: jmespath.search(x.group().strip(r"{|}"), {"env": env, "const": constants, **kwargs}), str)


def substitute_in_dict(dict, **kwargs):
    return {k: (substitute(v, **kwargs) if type(v) == str else v) for k, v in dict.items()}


def group_by(dicts, key):
    f = itemgetter(key)
    return groupby(sorted(dicts, key=f), f)


def filter_keys(dicts, keys_to_keep):
    keys_to_keep = set(keys_to_keep)
    for o in dicts:
        yield {k: v for k, v in o.items() if k in keys_to_keep}


def load_yaml(path):
    with open(path, "r") as stream:
        return yaml.safe_load(stream)


class WoobFilter(object):
    """Stream wrapper to filter woob lib print"""

    def __init__(self, stream):
        self.stream = stream
        self.triggered = False

    def __getattr__(self, attr_name):
        return getattr(self.stream, attr_name)

    def write(self, data):
        if data == '\n' and self.triggered:
            self.triggered = False
        elif data.startswith("==="):
            self.triggered = True
            return
        else:
            self.stream.write(data)
            self.stream.flush()

    def flush(self):
        self.stream.flush()

# Gotify


def send_gotify_notification(title, message):
    gotify_url = os.getenv('GOTIFY_URL')
    gotify_token = os.getenv('GOTIFY_TOKEN')
    requests.post(f'{gotify_url}/message', json={'title': title,
                  'message': message}, headers={'X-Gotify-Key': gotify_token})

# Woob


def get_woob_data(module_name, params, fn_to_call, account=None):
    # TODO: Cache build_backend for perfs
    b = w.build_backend(module_name, params=params, nofail=True)
    args = [b.get_account(account)] if account else []
    res = getattr(b, fn_to_call)(*args)
    return map(lambda x: {k: (None if isinstance(v, EmptyType) else v) for k, v in x.to_dict().items()}, res)

# S3


def get_s3_prefix(s3_path):
    return s3_path[:s3_path.rfind('/')+1]


def remove_already_existing_s3_keys(commands):
    last_prefix = None
    keys_on_bucket = set()

    for c in sorted(commands, key=lambda x: x["s3_params"]["key"]):
        key = c["s3_params"]["key"]
        prefix = get_s3_prefix(key)

        if (prefix != last_prefix):
            r = s3_client.list_objects_v2(
                Bucket=c["s3_params"]["bucket"],
                Prefix=prefix,
                StartAfter=key[:-1],
            )
            keys_on_bucket = set(map(itemgetter('Key'), r.get("Contents", [])))
            last_prefix = prefix

        if (not key in keys_on_bucket):
            yield c


def s3_put_commands(commands):
    for c in commands:
        key = jmespath.search("s3_params.key", c)
        print("Pushing: ", key)

        encode_as = re.search(r'\.(\w+)$', key).group(1)

        if (encode_as != "csv"):
            raise Exception(f"Cannot encode to '{encode_as}'")
        put_to_s3_as_csv(c["data"], **humps.pascalize(c["s3_params"]))


def put_to_s3_as_csv(dicts, **kwargs):
    buff = StringIO()
    writer = csv.writer(buff, quoting=csv.QUOTE_NONNUMERIC)

    try:
        for idx, o in enumerate(dicts):
            if (idx == 0):
                writer.writerow(o.keys())
            writer.writerow(o.values())

        s3_client.put_object(
            **kwargs, Body=BytesIO(buff.getvalue().encode('utf8')))
    finally:
        buff.close()

# App


def run_extract(backends, extract_name, extract_info):
    def conf(path): return jmespath.search(path, extract_info)

    print("Run woob extract ", extract_name)

    try:
        backend = backends[conf("woob.backend")]
        data = get_woob_data(backend["module"], substitute_in_dict(backend["params"]),
                             conf("woob.fn"), **substitute_in_dict(conf("woob.fn_params") or {}))

        if (conf("data.fields")):
            data = filter_keys(data, conf("data.fields"))

        s3_commands = []
        s3_params = {k: v for k, v in conf("s3").items() if k not in {
            "prevent_overwrite"}}

        if (conf("data.group_by")):
            data = group_by(data, conf("data.group_by"))
            for k, v in data:
                group_str = re.sub(r"[^A-Za-z0-9]+", '', k.__str__())
                s3_commands.append({"data": list(v), "s3_params": substitute_in_dict(
                    s3_params, group_value=group_str)})

        else:
            s3_commands.append(
                {"data": data, "s3_params": substitute_in_dict(s3_params)})

        if (conf("s3.prevent_overwrite")):
            s3_commands = remove_already_existing_s3_keys(s3_commands)

        s3_put_commands(s3_commands)
    except Exception:
        print("Exception occured on extract ", extract_name)
        send_gotify_notification(
            f"Exception failled for '{extract_name}'", traceback.format_exc())
        traceback.print_exc()


def main(args):
    to_run = args.extracts

    config = load_yaml(args.config)
    extracts = config["extracts"]

    print("Found %s extracts" % (len(extracts)))
    for k, v in extracts.items():
        if (to_run and not k in to_run):
            print("Extract %s ignored" % k)
            continue

        run_extract(config["woob"]["backends"], k, v)
    print("End syncing")


if __name__ == '__main__':
    sys.stderr = WoobFilter(sys.stderr)
    parser = argparse.ArgumentParser(description='Woob extractor')
    parser.add_argument('--config', type=str, default="/etc/config.yaml",
                        help='Location of the config file')
    parser.add_argument('--extracts', type=str, nargs="*",
                        default=None, help='Run only specified extracts')
    args = parser.parse_args()
    print(args)
    main(args)
