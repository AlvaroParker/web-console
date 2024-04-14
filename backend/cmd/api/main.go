package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/AlvaroParker/web-console/internal/api/server"
)

// github.com/AlvaroParker/web-console
func main() {
	errMkdir := os.Mkdir("tmp", 0777)
	if errMkdir != nil {
		if os.IsExist(errMkdir) {
			log.Println("Directory already exists.")
		}
	}

	fmt.Println("Starting the server...")
	// We create the http server
	http_server := server.CreateServer()

	err := http_server.ListenAndServe()
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Println("Server closed.")
		return
	} else if err != nil {
		fmt.Fprintln(os.Stderr, "Error while starting the server: ", err)
		os.Exit(1)
	}
}
