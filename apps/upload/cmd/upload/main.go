package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

	"code.cloudfoundry.org/bytefmt"
	"github.com/dghubble/sling"
	"github.com/tus/tusd/pkg/filestore"

	dcopy "github.com/hugocarreira/go-decent-copy"
	tusd "github.com/tus/tusd/pkg/handler"
)

var defaultClient = &http.Client{}

var tempPath = os.Getenv("UPLOAD_TEMP_DIR")

var paths = map[string]string{
	"public":  os.Getenv("UPLOAD_PUBLIC_DIR"),
	"private": os.Getenv("UPLOAD_PRIVATE_DIR"),
	"default": os.Getenv("UPLOAD_DEFAULT_DIR"),
}

func main() {
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		panic(fmt.Errorf("Getting current folder failled: %s", err))
	}

	fmt.Println("Starting upload server", dir)

	fs := http.FileServer(http.Dir(filepath.Join(dir ,"../../web/dist/")))

	http.Handle("/", fs)

	// Create a new FileStore instance which is responsible for
	// storing the uploaded file on disk in the specified directory.
	// This path _must_ exist before tusd will store uploads in it.
	// If you want to save them on a different medium, for example
	// a remote FTP server, you can implement your own storage backend
	// by implementing the tusd.DataStore interface.
	store := filestore.FileStore{
		Path: tempPath,
	}

	// A storage backend for tusd may consist of multiple different parts which
	// handle upload creation, locking, termination and so on. The composer is a
	// place where all those separated pieces are joined together. In this example
	// we only use the file store but you may plug in multiple.
	composer := tusd.NewStoreComposer()
	store.UseIn(composer)

	// Create a new HTTP handler for the tusd server by providing a configuration.
	// The StoreComposer property must be set to allow the handler to function.
	handler, err := tusd.NewHandler(tusd.Config{
		BasePath:              "/files/",
		StoreComposer:         composer,
		NotifyCompleteUploads: true,
		RespectForwardedHeaders: true,
	})
	if err != nil {
		panic(fmt.Errorf("Unable to create handler: %s", err))
	}

	// Start another goroutine for receiving events from the handler whenever
	// an upload is completed. The event will contains details about the upload
	// itself and the relevant HTTP request.
	go func() {
		for {
			event := <-handler.CompleteUploads
			err := handleFinishedUpload(&event.Upload)

			fDesc := fmt.Sprintf("[file='%s', folder='%s', size='%s', id='%s']",
				event.Upload.MetaData["filename"],
				event.Upload.MetaData["destination"],
				bytefmt.ByteSize(uint64(event.Upload.Size)),
				event.Upload.ID,
			)

			if err == nil {
				succText := fmt.Sprintf("Just uploaded file: %s", fDesc)
				fmt.Println(succText)
				err := sendNotification("Upload completed", succText)
				fmt.Println(err)
			} else {
				errText := fmt.Sprintf("Error while uploading file: %s", fDesc)
				fmt.Println(errText)
				err := sendNotification("Upload failled", errText)
				fmt.Println(err)
			}
		}
	}()

	// Right now, nothing has happened since we need to start the HTTP server on
	// our own. In the end, tusd will start listening on and accept request at
	// http://localhost:8080/files
	http.Handle("/files/", http.StripPrefix("/files/", handler))

	http.Handle("/healthz", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	http.Handle("/reset", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		files, err := ioutil.ReadDir(tempPath)
		if err != nil {
			goto errorHandling
		}

		for _, f := range files {
			filename := filepath.Join(tempPath, f.Name())
			err = os.Remove(filename)
		}

		w.WriteHeader(http.StatusOK)
		io.WriteString(w, "Cache reset done.\n")
		return
	errorHandling:
		w.WriteHeader(http.StatusInternalServerError)
		io.WriteString(w, err.Error()+"\n")
	}))

	err = http.ListenAndServe(":9006", nil)
	if err != nil {
		panic(fmt.Errorf("Unable to listen: %s", err))
	}
}

func sendNotification(title string, content string) error {
	url := os.Getenv("GOTIFY_URL")
	gotifyToken := os.Getenv("GOTIFY_TOKEN")

	notif := map[string]string{"title": title, "message": content}

	req, err := sling.New().Base(url).Set("X-Gotify-Key", gotifyToken).Post("/message").BodyJSON(notif).Request()
	if err != nil {
		return err
	}

	_, err = defaultClient.Do(req)
	return err
}

func handleFinishedUpload(upload *tusd.FileInfo) error {
	var destinationDir, destOk = paths[upload.MetaData["destination"]]
	var fileName = upload.MetaData["filename"]

	if !destOk || len(fileName) < 1 {
		return fmt.Errorf("Unable to determine destination path of file: %s, &s", destinationDir, fileName)
	}

	var source = filepath.Join(tempPath, upload.ID)
	var destination = filepath.Join(destinationDir, fileName)

	return dcopy.Copy(source, destination)
}
