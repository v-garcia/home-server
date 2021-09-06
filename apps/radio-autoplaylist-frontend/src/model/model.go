package model

type SpotifyID string

type Track struct {
	Title     string    `json:"title"`
	Artist    string    `json:"artist"`
	SpotifyId SpotifyID `json:"spotifyId"`
}
