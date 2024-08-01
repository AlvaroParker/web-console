package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/AlvaroParker/box-code/internal/database"
	"github.com/AlvaroParker/box-code/internal/driver"
	"github.com/charmbracelet/log"
	"github.com/docker/docker/errdefs"
)

const LimitContainers = 8

// Create new containers
// Possible HTTP response codes:
// - 201: Created
// - 401: Unauthorized
// - 500: Internal Server Error
// - 405: Method Not Allowed
// - 403: Forbidden
// - 400: Bad Request
func NewContainer(writer http.ResponseWriter, request *http.Request) {
	email, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Check the number of containers
	count, err := database.CountContainers(email)
	if err != nil {
		log.Error("[handlers.NewContainer] While counting the number of containers", "error", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	if count >= LimitContainers {
		log.Warn("[handlers.NewContainer] User has reached the limit of containers")
		writer.WriteHeader(http.StatusForbidden)
		return
	}

	var container database.Container
	if errJSON := json.NewDecoder(request.Body).Decode(&container) != nil; errJSON {
		log.Warn("[handlers.NewContainer] While decoding the request body: ", "error", errJSON)
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	// Check if the container is allowed
	if !isAllowed(container) {
		log.Warn("[handlers.NewContainer] Container not allowed")
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	if container.Image == "" || container.Tag == "" || container.Command == nil || container.Name == nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	// Generate a driver for the new container
	webContainer, errWc := container.GenerateWebContainer(nil)
	if errWc != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.NewContainer] While creating the WebContainer driver", "error", errWc)
		return
	}

	// Create the new container on docker a retrieve his id
	containerID, errCreate := webContainer.Create(context.Background())
	if errCreate != nil {
		// Check if the error was that the name is already taken
		if errdefs.IsConflict(errCreate) {
			writer.WriteHeader(http.StatusConflict)
			return
		}
		if errdefs.IsInvalidParameter(errCreate) {
			writer.WriteHeader(http.StatusBadRequest)
			return
		}
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.NewContainer] While creating the container", "error", errCreate)
		return
	}

	// Return the container ID
	if err := database.AddContainerDB(email, *containerID, container); err != nil {
		log.Error("[handlers.NewContainer] While adding the container to the database", "error", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	log.Info("[handlers.NewContainer] Container created", "ID", *containerID)
	writer.WriteHeader(http.StatusCreated)
}

// Delete existing containers
// Possible HTTP response codes:
// - 200: OK
// - 401: Unauthorized
// - 404: Not Found
// - 500: Internal Server Error
func DeleteContainer(writer http.ResponseWriter, request *http.Request) {
	log.Debug("[handlers.DeleteContainer] Request received")
	email, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	// Get the container ID from the URL
	containerID := request.PathValue("containerID")
	log.Info("Deleting container", "containerID", containerID)

	// Delete the container object on the database, this will trigger the actual container to delete as well
	success, err := database.DeleteContainerDB(containerID, email)
	if err != nil {
		log.Error("[handlers.DeleteContainer] While deleting  the container", "error", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	if success {
		return
	} else {
		writer.WriteHeader(http.StatusNotFound)
		return
	}
}

// List existing containers
// Possible HTTP resopnse codes:
// - 200: OK
// - 204: No Content
// - 401: Unauthorized
// - 405: Method Not Allowed
// - 500: Internal Server Error
func ListContainers(writer http.ResponseWriter, request *http.Request) {
	log.Debug("[handlers.ListContainers] Request received")

	user, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Get a list of containers metadata that the user owns
	meta, errDB := database.GetContainersMeta(user)
	if errDB != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.ListContainers] Error while querying the database: ", errDB)
		return
	}
	if len(meta) == 0 {
		writer.WriteHeader(http.StatusNoContent)
		return
	}
	// Convert the list of `ContainerMeta` to JSON
	jsonTerminals, errJSON := json.Marshal(meta)
	if errJSON != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.ListContainers] Error while marshalling the terminals: ", errJSON)
		return
	}
	writer.Header().Add("Content-Type", "application/json")
	writer.Write(jsonTerminals)
}

// Get the info of a container by it's id
func InfoContainer(writer http.ResponseWriter, request *http.Request) {
	log.Debug("[handlers.InfoContainer] Request received")

	email, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Get query parameters id
	id := request.URL.Query().Get("id")
	if id == "" {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	// Get container info (metadata)
	containerInfo, errGetContainerInfo := database.GetContainerInfo(id, email)
	if errGetContainerInfo != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.InfoContainer] Error while getting container info: ", errGetContainerInfo)
		return
	}
	// Convert to json
	jsonTerminal, errJSON := json.Marshal(containerInfo)
	if errJSON != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.InfoContainer] Error while marshalling the terminal: ", errJSON)
		return
	}

	writer.Header().Add("Content-Type", "application/json")
	writer.Write(jsonTerminal)
}

// This handler will return the list of valid images, and the commands that are valid for each images
// When a user creates a new container, the image and the command must be in the list of valid images
func GetImages(writer http.ResponseWriter, request *http.Request) {
	log.Debug("[handlers.GetImages] Request received")

	imagesDB, err := database.GetValidImages()
	if err != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.GetImages] Error while getting images from the database: ", err)
		return
	}
	// Convert to json
	jsonImages, errJSON := json.Marshal(imagesDB)
	if errJSON != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.GetImages] Error while marshalling the images: ", errJSON)
		return
	}
	writer.Header().Add("Content-Type", "application/json")
	writer.Write(jsonImages)
}

// Stops every container for the user
func HandleFullStop(writer http.ResponseWriter, request *http.Request) {
	log.Debug("[handlers.HandleFullStop] Request received")

	email, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	ids, err := database.GetContainersId(email)
	if err != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.HandleFullStop] Error while stopping all containers: ", err)
		return
	}
	for _, id := range ids {
		go driver.DeleteContainer(context.Background(), id)
	}
}

// This handler will resize the tty of container with the given id
func HandleResize(writer http.ResponseWriter, request *http.Request) {
	log.Debug("[handlers.HandleResize] Request received")

	_, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Get query parameters id
	id := request.URL.Query().Get("id")
	width, errW := strconv.ParseUint(request.URL.Query().Get("width"), 10, 0)
	height, errH := strconv.ParseUint(request.URL.Query().Get("height"), 10, 0)
	if id == "" || errW != nil || errH != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	if err := driver.ContainerResize(uint(height), uint(width), id); err != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Error("[handlers.HandleResize] Error while resizing the container: ", err)
		return
	}
}

// Check if the image provided is valid to create a new container
func isAllowed(container database.Container) bool {
	validImages, errDB := database.GetValidImages()
	if errDB != nil {
		log.Error("[handlers.isAllowed] Error while getting valid images: ", errDB)
		return false
	}

	fullImage := container.Image + ":" + container.Tag

	for _, allowedContainer := range validImages {
		if allowedContainer.ImageTag == fullImage {
			return true
		}
	}
	return false
}
