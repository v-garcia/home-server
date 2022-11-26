import utils
import jmespath
import s3_store
import influx
import functools
import re
from typing import Dict
from itertools import chain
import argparse
import operator

def list_in_dic(dic, l_key):
    dic = dict(dic)
    r = dic.get(l_key, [])
    dic.pop(l_key, None)
    return map(lambda e: e | dic, r)


def object_to_items(content_info, obj_response):
    bodies = obj_response['Body']
    request = obj_response['Request']
    response_metadata = obj_response['ResponseMetadata']
    request['KeyParts'] = request['Key'].split("/")
    if isinstance(bodies, Dict):
        if "items_key" in (content_info or {}):
            bodies = list_in_dic(bodies, content_info["items_key"])
        else:
            bodies = [bodies]

    for i in bodies:
        i['request'] = request
        i["response_metadata"] = response_metadata
        yield i


field_fns = {"int":  int,
             "float": float,
             "float_nullable": lambda x: float(x) if x else None,
             "s3_key_to_day": lambda k: re.search(r"\d{8}", k.split("/")[-1]).group()}
record_fns = {"name": lambda p, v: [p, v],
              "path": jmespath.search,
              "val": lambda p, _: utils.substitute(p),
              "fns": lambda p, v: utils.apply_fns(map(field_fns.__getitem__, p), v)}


def parse_field(record, field_info):
    try:
        if skip := field_info.get("skip_when", None):
            field, op, val = skip
            if getattr(operator, op)(record[field], val): return

        return functools.reduce(lambda acc, e: record_fns[e](field_info[e], acc) if acc != None and (e in field_info) else acc, ["val", "path", "fns", "name"], record)
    except Exception as e:
        e.args += record, field_info
        raise

def parse_record(record_info, record):
    parse_field_ = functools.partial(parse_field, record)
    parse_fields = lambda xs: dict(filter(None, map(parse_field_, xs)))

    return {**record_info,
            **{"time": parse_field_(record_info["time"]),
               "tags": parse_fields(record_info["tags"]),
               "fields": parse_fields(record_info["fields"])}}


def get_s3_start_after(input_type, last_date, s3_path):
    if (input_type != "daily"):
        raise Exception(f"Cannot handle input type: '{input_type}'")
    return last_date and utils.substitute(s3_path, day=last_date.strftime("%Y%m%d"))


def get_s3_prefix(s3_path):
    return s3_path[:s3_path.rfind('/')+1]


def date_to_str(input_type, date):
    if (input_type == "daily"):
        return date.strftime("%d/%m/%Y")
    else:
        return date.isoformat()


def tag_duplicate_datapoints(dps):
    acc = {}
    def get_key(dp): return (dp["time"], frozenset(dp.get("tags", {}).items()))
    for dp in dps:
        k = get_key(dp)
        nb_k = acc.get(k, 0)

        acc[k] = nb_k + 1
        yield dp if nb_k < 1 else {**dp, "tags": {**dp.get("tags", {}), "uniq": nb_k}}


def sync_measure(input_info):
    def conf(path): return jmespath.search(path, input_info)
    measure_name = conf("influx.bucket") + "." + conf("influx.measurement")

    try:
        # Fetch last datapoint time in influx
        fromTime = influx.last_measurement_datetime(
            conf("influx.bucket"), conf("influx.measurement"))
        print("Starting to fetch s3:%s from %s" % (conf("s3.bucket"), date_to_str(
            conf("type"), fromTime) if fromTime else "ever"))

        # Fetch objects
        objects = s3_store.get_and_parse_objects(
            Bucket=conf("s3.bucket"),
            Prefix=utils.substitute(get_s3_prefix(conf("s3.path"))),
            StartAfter=utils.substitute(get_s3_start_after(conf("type"), fromTime, conf("s3.path")) if fromTime is not None else get_s3_prefix(conf("s3.path"))))

        # Transform object to items
        items = chain.from_iterable(
            map(functools.partial(object_to_items, conf("content")), objects))

        # Transform record to flux datapoints
        datapoints = map(functools.partial(
            parse_record, conf("influx")), items)

        # Handle duplicate flux datapoints
        if (conf("influx.allow_duplicates")):
            datapoints = tag_duplicate_datapoints(datapoints)

        # Send datpoints to influx
        influx.write_datapoints(datapoints)

    except Exception as e:
        print("Exception occured while fetching %s" % (measure_name))
        print(e)


def main(args):
    config = utils.load_yaml(args.config)
    inputs = config["inputs"]
    print("Found %s measures to sync" % (len(inputs)))
    for input in config["inputs"]:
        sync_measure(input)
    print("End syncing")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='S3 to Influx')
    parser.add_argument('--config', type=str,
                        default="/etc/s3-to-influx-conf.yaml")
    args = parser.parse_args()
    print(args)
    main(args)
