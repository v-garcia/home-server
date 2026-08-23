package main

import (
	"context"
	"fmt"
	"os"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
)

func get_client() influxdb2.Client {
	return influxdb2.NewClient(os.Getenv("INFLUX_HOST"), os.Getenv("INFLUX_TOKEN"))
}

func main() {

	ctx := context.Background()
	client := get_client()

	d, err := client.TasksAPI().FindTasks(ctx, &api.TaskFilter{})

	if err != nil {
		fmt.Println("Error:", err)
	}

	fmt.Printf("%#v\n", d)
}

// fmt.Println(os.Environ())
