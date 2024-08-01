package handlers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/AlvaroParker/box-code/internal/database"
	"github.com/charmbracelet/log"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

// Route: `/console/ws handler`
//
// This handler will upgrade a GET request to a web socket connection and attach
// a container to it.
func ConsoleHandler(writer http.ResponseWriter, request *http.Request) {
	log.Debug("[handlers.ConsoleHandler] Request received")
	email, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	ctx := context.Background()

	hash := request.URL.Query().Get("hash")
	rawWidth := request.URL.Query().Get("width")
	rawHeight := request.URL.Query().Get("height")
	width, errW := strconv.Atoi(rawWidth)
	height, errH := strconv.Atoi(rawHeight)
	logs := request.URL.Query().Get("logs")
	logsBool := logs == "true"

	if hash == "" || rawWidth == "" || rawHeight == "" || errW != nil || errH != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}
	// Get the container owned by the given email with the given hash
	wc, err := database.GetContainer(email, hash)
	// Check if there was an error while creating the new WebContainer
	if err != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.ConsoleHandler] Error while creating the WebContainer", "error", err)
		return
	}
	errorCreate := wc.Start(ctx)
	if errorCreate != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.ConsoleHandler] Error while starting the container: ", errorCreate)
		return
	}

	// Upgrade the connection to a web socket
	// Blindly accept all origins: TODO: Change this to a more secure way
	upgrader.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	wsConn, err := upgrader.Upgrade(writer, request, nil)
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error while upgrading the connection: ", err)
	}

	wsConn.SetCloseHandler(func(code int, text string) error {
		go wc.Close(ctx)
		fmt.Println("Connection to client closed with code ", code)
		return nil
	})

	defer wsConn.Close()
	fmt.Println("Connection upgraded, attaching container...")
	wc.AttachContainer(ctx, true, wsConn, logsBool, width, height)
	defer wc.Close(ctx)
}
