import "influxdata/influxdb/monitor"
import "http"
import "json"
import "experimental"

option task = {name: "test2", every: 10m, offset: 0s}

headers = {"Content-Type": "application/json"}
endpoint = http["endpoint"](url: "http://10.152.183.2:3000/message?token=AEyoejDy18Nm949")
notification = {
    _notification_rule_id: "0aaf0ae2953ea000",
    _notification_rule_name: "test2",
    _notification_endpoint_id: "0a2e556f4069f000",
    _notification_endpoint_name: "Gotify post",
}
statuses = monitor["from"](start: -3m)
any_to_any = statuses |> monitor["stateChanges"](fromLevel: "any", toLevel: "any")
all_statuses =
    any_to_any |> filter(fn: (r) => r["_time"] >= experimental["subDuration"](from: now(), d: 30m))

any_to_any |> yield()

// all_statuses
//     |> monitor["notify"](
//         data: notification,
//         endpoint:
//             endpoint(
//                 mapFn: (r) => {
//                     body = {r with _version: 1}

//                     return {headers: headers, data: json["encode"](v: body)}
//                 },
//             ),
//     )
//     |> yield()
