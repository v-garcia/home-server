import datetime
import json
import os
import re
from calendar import monthrange
from pprint import pprint

import boto3
import dateutil.parser
import pygazpar
import requests
from botocore.config import Config

BUCKET_NAME = "grdf-tracker"
MAX_SEEK_DAYS = 30
SUB_MONTHLY_PRICE = 20.81
KHW_PRICE = 0.0833

usage_point_id = os.getenv('USAGE_POINT_ID')
grdf_user = os.getenv('GRDF_USER')
grdf_pwd = os.getenv('GRDF_PWD')
gotify_url = os.getenv('GOTIFY_URL')
gotify_token = os.getenv('GOTIFY_TOKEN')

# Utils functions


def get_last_object_key(s3_client, prefix):
    objs = s3_client.list_objects_v2(
        Bucket=BUCKET_NAME,
        Prefix=prefix,
    )

    if(objs['KeyCount'] < 1):
        return None

    objs = objs['Contents']
    objs = list(filter(lambda x: x['Size'] > 0, objs))
    objs = sorted(objs, key=lambda x: x['Key'], reverse=True)
    return objs[0]


def s3_key_to_date(key):
    day_str = re.search(r'^' + usage_point_id +
                        '\/daily\/(\d+).json$', key).group(1)
    return dateutil.parser.isoparse(day_str).date()


def date_to_s3_key(d):
    return f'{usage_point_id}/daily/{d.strftime("%Y%m%d")}.json'


def days_to_seek(s3_client):
    last_obj = get_last_object_key(s3_client, f'{usage_point_id}/daily/')
    if last_obj is None:
        return MAX_SEEK_DAYS

    return ((datetime.date.today() - s3_key_to_date(last_obj["Key"])).days - 1)


def get_price(day, energy_khw):
    nb_days = monthrange(day.year, day.month)[1]
    conso_flat = SUB_MONTHLY_PRICE / nb_days
    conso = KHW_PRICE * energy_khw
    text = '{} | {:.2f}€ ({:.2f}€ + {:.2f}€ flat)'.format(
        day.strftime("%d/%m/%Y"), (conso + conso_flat), conso, conso_flat)
    return {"text": text, "conso": conso, "conso_flat": conso_flat}


def get_gaz_data(last_n_days):
    client = pygazpar.Client(username=grdf_user,
                             password=grdf_pwd,
                             pceIdentifier=usage_point_id,
                             lastNDays=last_n_days,
                             tmpDirectory='./')
    client.update()
    return client.data()


# Run
print("Starting GRDF tracker")

s3_client = boto3.client('s3',
                         region_name=os.getenv('AWS_REGION'),
                         endpoint_url=os.getenv('AWS_S3_ENDPOINT'))

last_n_days = days_to_seek(s3_client)
print(f'Getting gaz data for last {last_n_days} days')

data = get_gaz_data(last_n_days)

# update date type & sort
data = list(map(lambda x: x.update({'time_period': datetime.datetime.strptime(
    x['time_period'], '%d/%m/%Y').date()}) or x, data))
data = sorted(data, key=lambda x: x['time_period'])

for x in data:
    print(f'processing day {x["time_period"]:%Y-%m-%d}')

    # s3 save
    to_save = {'unit': 'khw',
               'value': x['energy_kwh'], 'end_index_m3': x['end_index_m3']}
    s3_client.put_object(Bucket=BUCKET_NAME, Key=date_to_s3_key(
        x["time_period"]), Body=json.dumps(to_save))

    # gotify notif
    price_info = get_price(x['time_period'], x['energy_kwh'])
    r = requests.post(f'{gotify_url}/message', json={
                      'title': f'Gaz consumption {x["time_period"].strftime("%-d %b")}', 'message': price_info["text"]}, headers={'X-Gotify-Key': gotify_token})

print("End")
