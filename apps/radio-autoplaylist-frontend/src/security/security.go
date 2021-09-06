package security

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"radio-autoplaylist-frontend/src/model"
	"strings"
)

const Secret = "nkf73YjR5?@US4v"

func ComputeHmac256(message string, secret string) string {
	key := []byte(secret)
	h := hmac.New(sha256.New, key)
	h.Write([]byte(message))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

func ComputeHashForTrack(t model.Track) string {
	hash := ComputeHmac256(strings.Join([]string{t.Artist, t.Title, string(t.SpotifyId)}, ":"), Secret)
	return hash
}
