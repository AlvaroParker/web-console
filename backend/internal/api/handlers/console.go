package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/AlvaroParker/web-console/internal/api/models"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

// Route: `/console/ws handler`
//
// This handler will upgrade a GET request to a web socket connection and attach
// a container to it.
func ConsoleHandler(writer http.ResponseWriter, request *http.Request) {
	models.CorsHeaders(writer, request)
	if request.Method == http.MethodOptions {
		writer.Header().Set("Access-Control-Allow-Methods", "GET")
		writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		writer.WriteHeader(http.StatusOK)
		return
	}
	// Check if the metdho is GET
	if request.Method != http.MethodGet {
		writer.Header().Add("Allow", http.MethodGet)
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	email, errAuth := models.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	hash := request.URL.Query().Get("hash")
	raw_width := request.URL.Query().Get("width")
	raw_height := request.URL.Query().Get("height")
	width, errW := strconv.Atoi(raw_width)
	height, errH := strconv.Atoi(raw_height)

	if hash == "" || raw_width == "" || raw_height == "" || errW != nil || errH != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}
	container := models.ValidateContainer(email, hash)
	if container == nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	// Create a new WebContainer
	webContainer, errorNewWC := models.NewWebContainer(*container, &hash)
	// Check if there was an error while creating the new WebContainer
	if errorNewWC != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Println("[handlers.ConsoleHandler] Error while creating the WebContainer: ", errorNewWC)
		return
	}
	errorCreate := webContainer.Start()
	if errorCreate != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Println("[handlers.ConsoleHandler] Error while starting the container: ", errorCreate)
		return
	}

	// Upgrade the connection to a web socket
	// Blindly accept all origins: TODO: Change this to a more secure way
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

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
	webContainer.AttachContainer(true, ws_conn, width, height)
	defer webContainer.Close()
}
