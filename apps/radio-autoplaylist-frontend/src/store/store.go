package store

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"sort"
	"strings"
	"time"

	"radio-autoplaylist-frontend/src/model"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"gocloud.dev/blob"
	"gocloud.dev/blob/s3blob"
)

func GetBucket(ctx context.Context) (*blob.Bucket, error) {
	sess, err := session.NewSession(&aws.Config{
		Region:   aws.String("fr-par"),
		Endpoint: aws.String("https://s3.fr-par.scw.cloud"),
	})
	if err != nil {
		return nil, err
	}
	// Create a *blob.Bucket.
	bucket, err := s3blob.OpenBucket(ctx, sess, "radio-autoplaylist", nil)

	if err != nil {
		return nil, err
	}

	return bucket, nil
}

func GetKeys(ctx context.Context, bucket *blob.Bucket, prefix string) ([]string, error) {
	var result []string

	iter := bucket.List(&blob.ListOptions{
		Prefix: prefix,
	})

	for {
		obj, err := iter.Next(ctx)
		if err == io.EOF {
			break
		}
		if obj.Size == 0 {
			continue
		}
		if err != nil {
			return nil, err
		}

		result = append(result, obj.Key)
	}

	return result, nil
}

func GetTracks(ctx context.Context, bucket *blob.Bucket, key string) ([]model.Track, error) {
	var tracks []model.Track
	r, err := bucket.NewReader(ctx, key, nil)
	if err != nil {
		return nil, err
	}
	defer r.Close()

	b, err := ioutil.ReadAll(r)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(b, &tracks)

	return tracks, nil
}

const nbExportsToTake = 2

func trackKey(t model.Track) string {
	return strings.Join([]string{t.Artist, t.Title}, ":")
}

func GetNotFoundTracks(ctx context.Context, bucket *blob.Bucket) ([]model.Track, error) {
	notFoundKeys, err := GetKeys(ctx, bucket, "spotify-not-found/exported/")
	if err != nil {
		return nil, err
	}
	sort.Sort(sort.Reverse(sort.StringSlice(notFoundKeys)))
	notFoundKeys = notFoundKeys[:nbExportsToTake]

	foundKeys, err := GetKeys(ctx, bucket, "spotify-not-found/to-import/")
	sort.Sort(sort.StringSlice(foundKeys))
	if err != nil {
		return nil, err
	}

	keys := append(notFoundKeys, foundKeys...)

	// Use map to dedupe
	tracksMap := make(map[string]model.Track)
	for i, _ := range keys {
		tracks, err := GetTracks(ctx, bucket, keys[i])
		if err != nil {
			return nil, err
		}
		for _, track := range tracks {
			tracksMap[trackKey(track)] = track
		}
	}

	// Conver map to simple array
	r := make([]model.Track, 0, len(tracksMap))
	for _, track := range tracksMap {
		r = append(r, track)
	}

	return r, nil
}

func SaveTracks(ctx context.Context, bucket *blob.Bucket, tracks []model.Track) error {
	key := fmt.Sprintf("spotify-not-found/to-import/%d_tracks.json", time.Now().Unix())
	w, err := bucket.NewWriter(ctx, key, &blob.WriterOptions{ContentType: "application/json"})
	if err != nil {
		return err
	}

	var buffer bytes.Buffer
	encoder := json.NewEncoder(&buffer)
	encoder.SetIndent("", "  ")

	err = encoder.Encode(tracks)
	if err != nil {
		return err
	}

	_, err = w.Write(buffer.Bytes())
	if err != nil {
		return err
	}

	return w.Close()
}
