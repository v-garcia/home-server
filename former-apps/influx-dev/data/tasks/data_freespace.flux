import "influxdata/influxdb/monitor"
import "influxdata/influxdb/v1"
import "math"

data =
    from(bucket: "server-info")
        |> range(start: -15m)
        |> filter(fn: (r) => r["_measurement"] == "disk")
        |> filter(fn: (r) => r["_field"] == "free")
        |> filter(fn: (r) => r["device"] == "sda3")
        |> aggregateWindow(every: 15m, fn: min, createEmpty: false)
        

option task = {name: "Data disk free space", every: 30m, offset: 0s}

check = {_check_id: "data-freespace", _check_name: "Data partition free space", _type: "threshold", tags: {}}

gbWarnThresold = 20.0
gbCritThresold = 0.5

ok = (r) => r["free"] >= (gbWarnThresold * math.pow(x: 1024.0, y: 3.0))
warn = (r) => r["free"] < (gbWarnThresold * math.pow(x: 1024.0, y: 3.0))
crit = (r) => r["free"] < (gbCritThresold * math.pow(x: 1024.0, y: 3.0))

messageFn = (r) =>  if r._level == "warn" then
                        "Data disk went under ${gbWarnThresold} Gb"
                    else if r._level == "crit" then
                        "Data disk went under ${gbCritThresold} Gb"
                    else
                        "Data disk has enough free space"
data 
  |> v1["fieldsAsCols"]()
  |> monitor["check"](data: check, messageFn: messageFn, ok:ok, warn: warn, crit: crit)