import "math"

monthlyFlatRage = 1136
kwhPrice = 17.4


toNDecimal = (n=2, v) => {
    coeff = math.pow10(n: n)
    return (math.round(x: v * coeff) / coeff)
}

from(bucket: "my-data")
    |> range(start: -1y, stop: today())
    |> filter(fn: (r) => r["_measurement"] == "enedis_daily")
    |> filter(fn: (r) => r["_field"] == "consumption")
    |> filter(fn: (r) => r["unit"] == "Wh")
    |> window(every: 1mo)
    |> sum()
    |> keep(columns: ["_start", "_stop", "_value"])
    |> map(
        fn: (r) =>
            ({r with price: toNDecimal(v: (kwhPrice / 1000.0 * float(v: r._value) + float(v: monthlyFlatRage)) / 100.0)}),
    )
    |> group()