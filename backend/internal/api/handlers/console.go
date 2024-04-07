package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/AlvaroParker/web-console/internal/api/models"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

// Route: `/console/ws handler`
//
// This handler will upgrade a GET request to a web socket connection and attach
// a container to it.
func ConsoleHandler(writer http.ResponseWriter, request *http.Request) {
	// Check if the metdho is GET
	if request.Method != http.MethodGet {
		writer.Header().Add("Allow", http.MethodGet)
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	// Create a new WebContainer
	webContainer, errorNewWC := models.NewWebContainer()
	// Check if there was an error while creating the new WebContainer
	if errorNewWC != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(os.Stderr, "Error while creating the WebContainer: ", errorNewWC)
	}
	errorCreate := webContainer.Create()
	if errorCreate != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintln(os.Stderr, "Error while creating the container: ", errorCreate)
	}

	// Upgrade the connection to a web socket
	log.Println("Upgrading connection to web socket...")
	// Blindly accept all origins: TODO: Change this to a more secure way
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	ws_conn, err := upgrader.Upgrade(writer, request, nil)
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error while upgrading the connection: ", err)
	}

	ws_conn.SetCloseHandler(func(code int, text string) error {
		go webContainer.Close()
		fmt.Println("Connection to client closed with code ", code)
		return nil
	})

	defer ws_conn.Close()
	fmt.Println("Connection upgraded, attaching container...")
	webContainer.AttachContainer(false, ws_conn)
	defer webContainer.Close()
}
