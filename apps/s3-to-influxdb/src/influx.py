import os
import jmespath
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS

client = InfluxDBClient(url=os.getenv('INFLUXDB_URL'),
                        token=os.getenv('INFLUXDB_TOKEN'),
                        org=os.getenv('INFLUXDB_ORGANIZATION')) # , debug=True

query_api = client.query_api()
write_api = client.write_api(write_options=SYNCHRONOUS)

def last_measurement_datetime(bucket, measurement):
    r = query_api.query('''
        from(bucket: _bucket)
            |> range(start: -2y)
            |> filter(fn: (r) => r["_measurement"] == _measurement)
            |> map(fn: (r) => ({"_time": r._time}))
            |> sort(columns: ["_time"])
            |> last(column: "_time")
    ''', params={"_bucket": bucket, "_measurement": measurement})

    return jmespath.search('[0][0]', r.to_values(columns=['_time']))

def write_datapoints(datapoints):
    batch_size = 200
    batch = []
    
    while (x := next(datapoints, None)) is not None or batch:
        if(len(batch) == batch_size or x is None or (batch and x["bucket"] != batch[0]["bucket"])):
            print("Sending batch of %s datapoints to influx bucket: %s" % (str(len(batch)), batch[0]["bucket"]))
            write_api.write(bucket=batch[0]["bucket"], record=batch)
            batch.clear()

        x and batch.append(x)