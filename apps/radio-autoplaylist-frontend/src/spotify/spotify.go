package spotify

import (
	"context"
	"os"
	"radio-autoplaylist-frontend/src/model"

	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	"golang.org/x/oauth2/clientcredentials"
)

func GetClient(ctx context.Context) (*spotify.Client, error) {
	config := &clientcredentials.Config{
		ClientID:     os.Getenv("SPOTIFY_CLIENT_ID"),
		ClientSecret: os.Getenv("SPOTIFY_CLIENT_SECRET"),
		TokenURL:     spotifyauth.TokenURL,
	}
	token, err := config.Token(ctx)
	if err != nil {
		return nil, err
	}
	httpClient := spotifyauth.New().Client(ctx, token)
	client := spotify.New(httpClient)

	return client, nil
}

func ToSpotifyLibIds(ids []model.SpotifyID) []spotify.ID {
	result := make([]spotify.ID, len(ids))
	for i := range ids {
		result[i] = spotify.ID(ids[i])
	}
	return result
}

func GetNotFoundIds(ctx context.Context, client *spotify.Client, ids []model.SpotifyID) ([]model.SpotifyID, error) {
	var result []model.SpotifyID
	tracks, err := client.GetTracks(ctx, ToSpotifyLibIds(ids))
	if err != nil {
		return nil, err
	}
	for _, id := range ids {
		found := false
		for _, track := range tracks {
			if track != nil && track.ID == spotify.ID(id) {
				found = true
				break
			}
		}
		if !found {
			result = append(result, id)
		}

	}
	return result, nil
}
