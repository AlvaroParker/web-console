package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/AlvaroParker/web-console/internal/api/models"
	"github.com/docker/docker/errdefs"
)

var allowedContainers = []models.Container{
	{
		Image: "ubuntu",
		Tag:   "22.04",
	},
	{
		Image: "debian",
		Tag:   "stable",
	},
	{
		Image: "python",
		Tag:   "3.11",
	},
}

const LIMIT_CONTAINERS = 8

func ContainerHandler(writer http.ResponseWriter, request *http.Request) {
	models.CorsHeaders(writer, request)
	if request.Method == http.MethodOptions {
		writer.Header().Set("Access-Control-Allow-Methods", "POST")
		writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		writer.WriteHeader(http.StatusOK)
		return
	}
	switch request.Method {
	case http.MethodPost:
		NewContainer(writer, request)
	case http.MethodDelete:
		if strings.HasPrefix(request.URL.Path, "/container/") {
			DeleteContainer(writer, request)
		} else {
			writer.WriteHeader(http.StatusNotFound)
		}
	case http.MethodGet:
		ListContainers(writer, request)
	default:
		writer.WriteHeader(http.StatusMethodNotAllowed)
	}
}

// Create new containers
// Possible HTTP response codes:
// - 201: Created
// - 401: Unauthorized
// - 500: Internal Server Error
// - 405: Method Not Allowed
// - 403: Forbidden
// - 400: Bad Request
func NewContainer(writer http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	email, errAuth := models.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Check the number of containers
	count, err := models.CountContainers(email)
	if err != nil {
		log.Println("[handlers.NewContainer] Error while counting the number of containers: ", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	if count >= LIMIT_CONTAINERS {
		log.Println("[handlers.NewContainer] User has reached the limit of containers")
		writer.WriteHeader(http.StatusForbidden)
		return
	}

	var container models.Container
	if errJson := json.NewDecoder(request.Body).Decode(&container) != nil; errJson {
		log.Println("[handlers.NewContainer] Error while decoding the request body: ", errJson)
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	// Check if the container is allowed
	if !isAllowed(container) {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	if container.Image == "" || container.Tag == "" || container.Command == nil || container.Name == nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	webContainer, errWc := models.NewWebContainer(container)
	if errWc != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Println("[handlers.NewContainer] Error while creating the WebContainer: ", errWc)
		return
	}

	containerID, errCreate := webContainer.Create()
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
		log.Println("[handlers.NewContainer] Error while creating the container: ", errCreate)
		return
	}

	// Return the container ID
	if err := models.AddContainerDB(email, *containerID, container); err != nil {
		log.Println("[handlers.NewContainer] Error while adding the container to the database: ", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	log.Println("[handlers.NewContainer] Container created with ID: ", *containerID)
	writer.WriteHeader(http.StatusCreated)
}

// Delete existing containers
// Possible HTTP response codes:
// - 200: OK
// - 401: Unauthorized
// - 404: Not Found
// - 500: Internal Server Error
func DeleteContainer(writer http.ResponseWriter, request *http.Request) {
	// Check if the method is DELETE
	if request.Method != http.MethodDelete {
		writer.Header().Add("Allow", http.MethodDelete)
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	email, errAuth := models.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	// Get the container ID from the URL
	containerID := strings.TrimPrefix(request.URL.Path, "/container/")

	// Delete the container
	log.Println("[handlers.DeleteContainer] Deleting container with ID: ", containerID)
	success, err := models.DeleteContainerDB(containerID, email)
	if err != nil {
		log.Println("[handlers.DeleteContainer] Error while deleting the container: ", err)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	if success {
		writer.WriteHeader(http.StatusOK)
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
	// Check if the method is GET
	if request.Method != http.MethodGet {
		writer.Header().Add("Allow", http.MethodGet)
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	user, errAuth := models.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	// rowsDB
	terminals, errDb := models.GetTerminals(user)
	if errDb != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Println("[handlers.ListContainers] Error while querying the database: ", errDb)
		return
	}
	if len(terminals) == 0 {
		writer.WriteHeader(http.StatusNoContent)
		return
	}
	// Convert the list of `Terminal` to JSON
	jsonTerminals, errJson := json.Marshal(terminals)
	if errJson != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		log.Println("[handlers.ListContainers] Error while marshalling the terminals: ", errJson)
		return
	}
	writer.Header().Add("Content-Type", "application/json")
	writer.Write(jsonTerminals)
	writer.WriteHeader(http.StatusOK)
	return
}

// Check if the image provided is valid to create a new container
func isAllowed(container models.Container) bool {
	log.Println("[handlers.isAllowed] Checking if container is allowed: ", container)
	fullImage := container.Image + ":" + container.Tag
	for _, allowedContainer := range allowedContainers {
		if allowedContainer.Image+":"+allowedContainer.Tag == fullImage {
			return true
		}
	}
	return false
}
