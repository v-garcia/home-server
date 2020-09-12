package main

import (
	"fmt"
	tmdb "github.com/cyruzin/golang-tmdb"
	rp "github.com/cytec/releaseparser"
	"github.com/urfave/cli/v2"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

var imageURL = "https://image.tmdb.org/t/p/w500/"
var videoExtensions = []string{".avi", ".mkv", ".mp4"}

// VideoQuery is a query representation
type VideoQuery struct {
	title string
	year  int
}

type AppParams struct {
	scanPath       string
	tmdbAPIKey     string
	searchLanguage string
}

// releaseToQuery transform release to query
func releaseToQuery(release *rp.Release) VideoQuery {

	if release.Title == "" {
		return VideoQuery{release.Input, 0}
	}

	if release.Type == "tvshow" {
		return VideoQuery{release.Title, 0}
	}

	return VideoQuery{release.Title, release.Year}
}

// getPictureLink get link url from a file name
func getPictureLink(client *tmdb.Client, params AppParams, query *VideoQuery) (string, error) {
	var link = ""

	// It there is a year, we assume it's a movie
	if query.year > 0 {
		result, err := client.GetSearchMovies(query.title,
			map[string]string{
				"year":     strconv.Itoa(query.year),
				"language": params.searchLanguage})
		if err != nil {
			return "", err
		}

		if len(result.Results) > 0 {
			link = result.Results[0].PosterPath

			for i := 1; i < len(result.Results); i++ {
				if strings.EqualFold(result.Results[i].Title, query.title) ||
					strings.EqualFold(result.Results[i].OriginalTitle, query.title) {
					link = result.Results[i].PosterPath
					break
				}
			}
		}
	} else {
		result, err := client.GetSearchMulti(query.title, map[string]string{"language": params.searchLanguage})
		if err != nil {
			return "", err
		}

		if len(result.Results) > 0 {
			link = result.Results[0].PosterPath

			for i := 1; i < len(result.Results); i++ {
				if strings.EqualFold(result.Results[i].Title, query.title) ||
					strings.EqualFold(result.Results[i].OriginalTitle, query.title) {
					link = result.Results[i].PosterPath
					break
				}
			}
		}

	}

	if link != "" {
		link = imageURL + link
	}
	return link, nil
}

func contains(arr []string, str string) bool {
	for _, a := range arr {
		if a == str {
			return true
		}
	}
	return false
}

func downloadFile(filepath string, url string) error {

	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Create the file
	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()

	// Write the body to file
	_, err = io.Copy(out, resp.Body)
	return err
}

// fileExists Not handling error correctly, but sufficient here
func fileExists(name string) bool {
	_, err := os.Stat(name)
	return !os.IsNotExist(err)
}

func main() {
	app := &cli.App{
		Name:  "Add Video Cover",
		Usage: "Add video cover next to each video file",
		Action: func(c *cli.Context) error {

			var appParams = AppParams{
				scanPath:       c.String("path"),
				searchLanguage: c.String("lang"),
				tmdbAPIKey:     c.String("tmdb-api-key"),
			}

			run(appParams)

			return nil
		},
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:        "path",
				Aliases:     []string{"p"},
				Value:       "/media/",
				DefaultText: "/media/",
				Usage:       "Path to look videos in (recursive)",
				EnvVars:     []string{"PATH"},
			},
			&cli.StringFlag{
				Name:     "tmdb-api-key",
				Aliases:  []string{"k"},
				Usage:    "Api key from themoviedb.org",
				EnvVars:  []string{"TMDB_API_KEY"},
				Required: true,
			},
			&cli.StringFlag{
				Name:    "lang",
				Aliases: []string{"l"},
				Value:   "fr-Fr",
				Usage:   "Search language for themoviedb.org",
				EnvVars: []string{"SEARCH_LANGUAGE"},
			},
		}}

	err := app.Run(os.Args)
	if err != nil {
		panic(fmt.Errorf("Init api failled: %s", err))
	}
}

func run(params AppParams) {
	fmt.Println("Starting add-video-cover")

	tmdbClient, err := tmdb.Init(params.tmdbAPIKey)
	if err != nil {
		panic(fmt.Errorf("Init api failled: %s", err))
	}

	errWalk := filepath.Walk(params.scanPath, func(path string, f os.FileInfo, errWalkItem error) error {
		if errWalkItem != nil {
			fmt.Printf("Error on walk item: %+v\n", errWalkItem)
			return nil
		}
		if f.IsDir() {
			return nil
		}

		ext := filepath.Ext(path)

		if !contains(videoExtensions, ext) {
			return nil
		}

		var picturePath = strings.TrimSuffix(path, filepath.Ext(f.Name())) + ".jpg"
		if fileExists(picturePath) {
			return nil
		}

		var fName = strings.TrimSuffix(f.Name(), filepath.Ext(f.Name()))
		var release = rp.Parse(fName)
		var query = releaseToQuery(release)

		var link, errPic = getPictureLink(tmdbClient, params, &query)
		if errPic != nil {
			fmt.Printf("Error getting picture link: %+v\n", errPic)
			return nil
		}

		if link != "" {
			errDl := downloadFile(picturePath, link)
			if errDl != nil {
				fmt.Printf("Error downloading picture: %+v\n", errDl)
			}
			fmt.Printf("Downloaded new picture: %s\n", picturePath)
		} else {
			_, errEmpty := os.Create(picturePath)
			if errEmpty != nil {
				fmt.Printf("Unable to check if file exists: %+v\n", errEmpty)
			}
			fmt.Printf("Picture not found, setting empty: %+v\n", picturePath)
		}

		return nil
	})

	if errWalk != nil {
		fmt.Printf("Error walk: %v\n", errWalk)
	}

	fmt.Println("Ending add-video-cover")
}
