import "influxdata/influxdb/monitor"
import "experimental"
import "influxdata/influxdb/v1"


option task = {name: "Zigbee deadman check", every: 20m, offset: 0m, description: "My description"}


data =
    from(bucket: "iot")
        |> range(start: -2d)
        |> filter(fn: (r) => r["_measurement"] == "zigbee2mqtt")
        |> filter(fn: (r) => r["_field"] == "linkquality")
        |> filter(fn: (r) => exists r["name"]) // Only named devices are considered

check = {_check_id: "zigbee-deadman-check", _check_name: "Zigbee deadman check", _type: "deadman", tags: {}}

downDelay = 50m

messageFn = (r) =>  if r._level == "crit" then
                        "${r.name} didn't show up last ${downDelay}"
                    else
                        "${r.name} is up"
data
    |> v1["fieldsAsCols"]()
    |> monitor["deadman"](t: experimental["subDuration"](from: now(), d: downDelay))
    |> monitor["check"](data: check, messageFn: messageFn, crit: (r) => r["dead"], ok: (r) => not r["dead"])
