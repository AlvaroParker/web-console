package models

import (
	"context"
	"log"

	database "github.com/AlvaroParker/web-console/internal/api"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/lib/pq"
)

type Terminal struct {
	Id             int    `json:"id"`
	ContainerID    string `json:"containerid"`
	Email          string `json:"email"`
	Image          string `json:"image"`
	Tag            string `json:"tag"`
	Name           string `json:"name"`
	AutoRemove     bool   `json:"auto_remove"`
	NetworkEnabled bool   `json:"network_enabled"`
	Command        string `json:"command"`
}

type TerminalRes struct {
	ContainerID string `json:"containerid"`
	Image       string `json:"image"`
	Tag         string `json:"tag"`
	Name        string `json:"name"`
}

// func NewWebContainer(command string, image ImageType, autoRemove bool, name *string, networkEnabled bool) (*WebContainer, error) {
type Container struct {
	Image          string  `json:"image"`
	Tag            string  `json:"tag"`
	AutoRemove     bool    `json:"auto_remove"`
	Name           *string `json:"name"`
	NetworkEnabled bool    `json:"network_enabled"`
	Command        *string `json:"command"`
}

type ImagesDB struct {
	Id       int      `json:"id"`
	ImageTag string   `json:"image_tag"`
	Commands []string `json:"commands"`
}

func ValidateContainer(email string, hash string) *Container {
	var container Container
	query := database.DB.QueryRow("SELECT image, tag, name, auto_remove, network_enabled, command FROM terminals WHERE email = $1 and containerid = $2", email, hash)
	queryErr := query.Scan(&container.Image, &container.Tag, &container.Name, &container.AutoRemove, &container.NetworkEnabled, &container.Command)

	if queryErr != nil {
		log.Println("[models.ValidateContainer] Error while querying the database: ", queryErr)
		return nil
	}
	return &container
}

func GetTerminals(email string) ([]TerminalRes, error) {
	rowsDB, errorDb := database.DB.Query("SELECT containerid, image,tag, name FROM terminals WHERE email = $1", email)
	if errorDb != nil {
		return nil, errorDb
	}
	// Convert the rows to a list of `Terminal`
	// var terminals []Terminal
	var terminals []TerminalRes
	for rowsDB.Next() {
		var terminal TerminalRes
		if errScan := rowsDB.Scan(&terminal.ContainerID, &terminal.Image, &terminal.Tag, &terminal.Name); errScan != nil {
			return nil, errScan
		}

		terminals = append(terminals, terminal)
	}

	return terminals, nil
}

// Add a container ID to the database
func AddContainerDB(email string, containerID string, container Container) error {
	_, err := database.DB.Exec("INSERT INTO terminals (containerid, email, image, tag, name, auto_remove, network_enabled, command) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
		containerID, email, container.Image, container.Tag, container.Name, container.AutoRemove, container.NetworkEnabled, container.Command)
	return err
}

func DeleteContainerDB(id string, email string) (bool, error) {
	// Check if the container is running
	cli, err := client.NewClientWithOpts(client.FromEnv)
	// Delete using docker client
	if err != nil {
		return false, err
	}
	response, errInspect := cli.ContainerInspect(context.Background(), id)
	if errInspect != nil {
		return false, errInspect
	}

	if response.State.Running {
		return false, nil
	}

	sqlRes, errDB := database.DB.Exec("DELETE FROM terminals WHERE containerid = $1 and email = $2", id, email)
	if errDB != nil {
		return false, errDB
	}
	rowsAffected, _ := sqlRes.RowsAffected()
	if rowsAffected == 0 {
		return false, nil
	}

	errRmDocker := cli.ContainerRemove(context.Background(), id, container.RemoveOptions{})
	if errRmDocker != nil {
		return false, errRmDocker
	}
	return true, nil
}

func CountContainers(email string) (int, error) {
	rowsRes := database.DB.QueryRow("SELECT COUNT(*) FROM terminals WHERE email = $1", email)
	var count int
	err := rowsRes.Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func GetContainerInfo(id string, email string) (*TerminalRes, error) {
	query := database.DB.QueryRow("SELECT containerid, image, tag, name FROM terminals WHERE containerid = $1 and email = $2", id, email)
	var terminal TerminalRes
	errDb := query.Scan(&terminal.ContainerID, &terminal.Image, &terminal.Tag, &terminal.Name)
	if errDb != nil {
		return nil, errDb
	}

	return &terminal, nil
}

func GetValidImages() ([]ImagesDB, error) {
	rowsDB, errorDb := database.DB.Query("SELECT id, image_tag, commands FROM images")
	if errorDb != nil {
		return nil, errorDb
	}
	// Convert the rows to a list of `Terminal`
	var images []ImagesDB
	for rowsDB.Next() {
		var image ImagesDB
		if errScan := rowsDB.Scan(&image.Id, &image.ImageTag, (*pq.StringArray)(&image.Commands)); errScan != nil {
			return nil, errScan
		}

		images = append(images, image)
	}

	return images, nil
}

func FullStop(email string) error {
	rowsDB, errorDb := database.DB.Query("SELECT containerid FROM terminals WHERE email = $1", email)
	if errorDb != nil {
		return errorDb
	}

	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return err
	}

	for rowsDB.Next() {
		var containerID string
		if errScan := rowsDB.Scan(&containerID); errScan != nil {
			return errScan
		}
		go cli.ContainerStop(context.Background(), containerID, container.StopOptions{})
	}
	return nil
}
