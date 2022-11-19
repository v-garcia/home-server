import boto3
import csv
import os
import json
import jmespath
import re
import functools


@functools.cache
def get_client():
    return boto3.client('s3',
                        region_name=os.getenv('AWS_REGION'),
                        endpoint_url=os.getenv('AWS_S3_ENDPOINT'))


@functools.cache
def get_list_objects_paginator():
    return get_client().get_paginator('list_objects_v2')


class TextIterator:
    def __init__(self, iterable, encoding):
        self.iterable = iterable
        self.encoding = encoding

    def __iter__(self):
        return self

    def __next__(self):
        return self.iterable.__next__().decode(self.encoding)


def parse_csv(streaming_body):
    it = TextIterator(streaming_body.iter_lines(), "utf-8")
    for row in csv.DictReader(it):
        yield row


def parse_json(streaming_body):
    return json.load(streaming_body)


def parse_response_body(s3_object):
    s3_object = s3_object.copy()
    key = jmespath.search("Request.Key", s3_object)
    ext = re.search(r'\.(\w+)$', key).group(1)
    match ext:
        case "csv":
            s3_object["Body"] = parse_csv(s3_object["Body"])
        case "json":
            s3_object["Body"] = parse_json(s3_object["Body"])
        case _:
            raise Exception(f"Cannot parse extension '{ext}'")
    return s3_object


def get_object(*args, **kwargs):
    r = get_client().get_object(*args, **kwargs)
    r["Request"] = kwargs
    return r


def get_and_parse_object(*args, **kwargs):
    r = get_object(*args, **kwargs)
    return parse_response_body(r)


def get_and_parse_objects(*args, **kwargs):
    pages = get_list_objects_paginator().paginate(*args, **kwargs)
    keys = sorted(filter(None, pages.search("Contents[].Key")))
    for k in keys:
        print("Parsing s3 object %s:%s" % (kwargs["Bucket"], k))
        yield get_and_parse_object(Bucket=kwargs["Bucket"], Key=k)
