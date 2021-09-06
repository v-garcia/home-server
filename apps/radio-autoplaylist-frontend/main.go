package main

import (
	"context"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"radio-autoplaylist-frontend/src/model"
	"radio-autoplaylist-frontend/src/security"
	"radio-autoplaylist-frontend/src/spotify"
	"radio-autoplaylist-frontend/src/store"
	"radio-autoplaylist-frontend/src/views"
	"sort"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

var tplIndex *template.Template

// Initializer
func initResources() {
	tplIndex = template.Must(template.ParseFiles("templates/index.gohtml"))
}

func startHttpServer() *http.Server {
	r := mux.NewRouter()
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, "OK")
	})
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	r.HandleFunc("/", Index)

	srv := &http.Server{
		Handler:      r,
		Addr:         ":3000",
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe(): %v", err)
		}
	}()

	return srv
}

func main() {
	log.Println("Running radio-autoplaylist-frontend")
	err := godotenv.Load()
	if err != nil {
		log.Print("Error loading .env file") // Not fatal, we can directly pass
	}

	srv := startHttpServer()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM, syscall.SIGINT, syscall.SIGQUIT)
	initResources()

	sig := <-c
	log.Printf("Caught sig: %+v", sig)
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()
	srv.Shutdown(ctx)
	log.Println("shutting down")
	os.Exit(0)
}

func TrackToViewTrack(tIn model.Track) views.Track {
	hash := security.ComputeHashForTrack(tIn)
	tOut := views.Track{
		Title:     tIn.Title,
		Artist:    tIn.Artist,
		SpotifyId: string(tIn.SpotifyId),
		Hash1:     hash,
	}
	return tOut
}

func ParseRequest(r *http.Request) ([]views.Track, error) {
	err := r.ParseForm()
	if err != nil {
		return nil, err
	}

	var tracks []views.Track
	var i int
	for {
		hash := r.FormValue(fmt.Sprintf("t-hash1-%d", i))
		if hash == "" {
			break
		}

		track := views.Track{
			Title:        r.FormValue(fmt.Sprintf("t-title-%d", i)),
			Artist:       r.FormValue(fmt.Sprintf("t-artist-%d", i)),
			SpotifyId:    r.FormValue(fmt.Sprintf("t-spotify-id-%d", i)),
			NewSpotifyId: r.FormValue(fmt.Sprintf("t-new-spotify-id-%d", i)),
			Hash1:        hash,
		}

		tracks = append(tracks, track)
		i++
	}
	return tracks, nil
}

func ValidateInputTracks(ctx context.Context, tracks []views.Track) ([]model.Track, error) {
	var result []model.Track
	var toCheckOnSpotify []model.SpotifyID

	for _, t := range tracks {
		hash := security.ComputeHashForTrack(model.Track{Title: t.Title, Artist: t.Artist, SpotifyId: model.SpotifyID(t.SpotifyId)})

		if hash != t.Hash1 {
			fmt.Printf("Hashs mismatch %+v\n", t)
			return nil, fmt.Errorf("Form data for song \"%s:%s\" were altered", t.Artist, t.Title)
		}

		if t.NewSpotifyId == t.SpotifyId {
			continue
		}

		if t.NewSpotifyId != "" {
			toCheckOnSpotify = append(toCheckOnSpotify, model.SpotifyID(t.NewSpotifyId))
		}

		result = append(result, model.Track{Title: t.Title, Artist: t.Artist, SpotifyId: model.SpotifyID(t.NewSpotifyId)})

	}

	if len(result) == 0 || len(toCheckOnSpotify) == 0 {
		return result, nil
	}

	spotifyClient, err := spotify.GetClient(ctx)
	if err != nil {
		return nil, err
	}

	notFoundIds, err := spotify.GetNotFoundIds(ctx, spotifyClient, toCheckOnSpotify)
	if err != nil {
		return nil, err
	}

	if len(notFoundIds) > 0 {
		for _, t := range tracks {
			if model.SpotifyID(t.NewSpotifyId) == notFoundIds[0] {
				return nil, fmt.Errorf("Spotify id '%s' for track '%s - %s' is incorrect", t.NewSpotifyId, t.Artist, t.Title)
			}
		}
	}

	return result, nil
}

func SaveTracks(ctx context.Context, r *http.Request) error {
	fmt.Println("Save tracks")
	tracks, err := ParseRequest(r)
	if err != nil {
		return err
	}

	toAdd, err := ValidateInputTracks(ctx, tracks)
	if err != nil {
		return err
	}
	fmt.Printf("Validated tracks: %+v\n", toAdd)

	if len(toAdd) == 0 {
		return nil
	}

	bucket, err := store.GetBucket(ctx)
	if err != nil {
		return err
	}

	return store.SaveTracks(ctx, bucket, toAdd)
}

func DisplayTracks(ctx context.Context, responseData *views.Index) error {
	bucket, err := store.GetBucket(ctx)
	if err != nil {
		return err
	}
	defer bucket.Close()

	notFoundTracks, err := store.GetNotFoundTracks(ctx, bucket)
	if err != nil {
		return err
	}

	// Map to view list
	viewTracks := make([]views.Track, len(notFoundTracks))
	for i, t := range notFoundTracks {
		viewTracks[i] = TrackToViewTrack(t)
	}

	// Sort by name
	sort.Slice(viewTracks, func(i, j int) bool {
		return strings.ToLower(viewTracks[i].Artist+viewTracks[i].Title) < strings.ToLower(viewTracks[j].Artist+viewTracks[j].Title)
	})

	responseData.Tracks = viewTracks
	return nil
}

func Index(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	data := views.Index{Title: "Help to find spotify tracks!"}

	if r.Method == "POST" {
		err := SaveTracks(ctx, r)
		if err != nil {
			log.Println(err)
			data.Error = err.Error()
		}

	}

	err := DisplayTracks(ctx, &data)
	if err != nil {
		data.Error += err.Error()
	}

	tplIndex.Execute(w, data)
}
