package views

type Track struct {
	Title        string
	Artist       string
	SpotifyId    string
	NewSpotifyId string
	Hash1        string
}

type Index struct {
	Title  string
	Error  string
	Tracks []Track
}
