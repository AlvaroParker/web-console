package database

import (
	"context"
	"errors"

	"github.com/AlvaroParker/box-code/internal/driver"
	"github.com/charmbracelet/log"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/lib/pq"
)

// Container metadata
type ContainerMeta struct {
	ContainerID string `json:"containerid"`
	Image       string `json:"image"`
	Tag         string `json:"tag"`
	Name        string `json:"name"`
}

type Terminal struct {
	ID             int    `json:"id"`
	ContainerID    string `json:"containerid"`
	Email          string `json:"email"`
	Image          string `json:"image"`
	Tag            string `json:"tag"`
	Name           string `json:"name"`
	AutoRemove     bool   `json:"auto_remove"`
	NetworkEnabled bool   `json:"network_enabled"`
	Command        string `json:"command"`
}

type ImagesDB struct {
	ID       int      `json:"id"`
	ImageTag string   `json:"image_tag"`
	Commands []string `json:"commands"`
}

// Container configuration and used to store constainer instances on the database
type Container struct {
	Image          string  `json:"image"`
	Tag            string  `json:"tag"`
	AutoRemove     bool    `json:"auto_remove"`
	Name           *string `json:"name"`
	NetworkEnabled bool    `json:"network_enabled"`
	Command        *string `json:"command"`
}

func (c *Container) GenerateWebContainer(id *string) (*driver.WebContainer, error) {
	// Check if containerConf has empty values or non set
	if c.Image == "" || c.Tag == "" || c.Command == nil {
		return nil, errors.New("empty values in containerConf")
	}

	return &driver.WebContainer{
		Command:       *c.Command,
		Image:         driver.ImageType(c.Image + ":" + c.Tag),
		AttachIO:      true,
		AutoRemove:    c.AutoRemove,
		Name:          c.Name,
		Id:            id,
		NetworkEnable: c.NetworkEnabled,
	}, nil
}

func GetContainer(email string, hash string) (*driver.WebContainer, error) {
	var container Container
	query := DB.QueryRow("SELECT image, tag, name, auto_remove, network_enabled, command FROM terminals WHERE email = $1 and containerid = $2", email, hash)
	queryErr := query.Scan(&container.Image, &container.Tag, &container.Name, &container.AutoRemove, &container.NetworkEnabled, &container.Command)
	if queryErr != nil {
		log.Info("[models.ValidateContainer] Error while querying the database: ", queryErr)
		return nil, queryErr
	}

	return &driver.WebContainer{
		Command:       *container.Command,
		Image:         driver.ImageType(container.Image + ":" + container.Tag),
		AttachIO:      true,
		AutoRemove:    container.AutoRemove,
		Name:          container.Name,
		Id:            &hash,
		NetworkEnable: container.NetworkEnabled,
	}, nil
}

func GetContainersMeta(email string) ([]ContainerMeta, error) {
	rowsDB, errorDB := DB.Query("SELECT containerid, image,tag, name FROM terminals WHERE email = $1", email)
	if errorDB != nil {
		return nil, errorDB
	}
	// Convert the rows to a list of `Terminal`
	// var terminals []Terminal
	var terminals []ContainerMeta
	for rowsDB.Next() {
		var terminal ContainerMeta
		if errScan := rowsDB.Scan(&terminal.ContainerID, &terminal.Image, &terminal.Tag, &terminal.Name); errScan != nil {
			return nil, errScan
		}

		terminals = append(terminals, terminal)
	}

	return terminals, nil
}

// Add a container ID to the database
func AddContainerDB(email string, containerID string, container Container) error {
	_, err := DB.Exec("INSERT INTO terminals (containerid, email, image, tag, name, auto_remove, network_enabled, command) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
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

	sqlRes, errDB := DB.Exec("DELETE FROM terminals WHERE containerid = $1 and email = $2", id, email)
	if errDB != nil {
		return false, errDB
	}
	rowsAffected, _ := sqlRes.RowsAffected()
	if rowsAffected == 0 {
		return false, nil
	}

	errRmDocker := cli.ContainerRemove(context.Background(), id, container.RemoveOptions{Force: true})
	if errRmDocker != nil {
		return false, errRmDocker
	}
	return true, nil
}

func CountContainers(email string) (int, error) {
	rowsRes := DB.QueryRow("SELECT COUNT(*) FROM terminals WHERE email = $1", email)
	var count int
	err := rowsRes.Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func GetContainerInfo(id string, email string) (*ContainerMeta, error) {
	query := DB.QueryRow("SELECT containerid, image, tag, name FROM terminals WHERE containerid = $1 and email = $2", id, email)
	var terminal ContainerMeta
	errDB := query.Scan(&terminal.ContainerID, &terminal.Image, &terminal.Tag, &terminal.Name)
	if errDB != nil {
		return nil, errDB
	}

	return &terminal, nil
}

func GetValidImages() ([]ImagesDB, error) {
	rowsDB, errorDB := DB.Query("SELECT id, image_tag, commands FROM images")
	if errorDB != nil {
		return nil, errorDB
	}
	// Convert the rows to a list of `Terminal`
	var images []ImagesDB
	for rowsDB.Next() {
		var image ImagesDB
		if errScan := rowsDB.Scan(&image.ID, &image.ImageTag, (*pq.StringArray)(&image.Commands)); errScan != nil {
			return nil, errScan
		}

		images = append(images, image)
	}

	return images, nil
}

func GetRunningContainers(email string) ([]ContainerMeta, error) {
	containers, errorDB := GetContainersMeta(email)
	if errorDB != nil {
		return nil, errorDB
	}
	var runningContainers []ContainerMeta
	client, clientErr := client.NewClientWithOpts(client.FromEnv)
	if clientErr != nil {
		return nil, clientErr
	}
	for _, container := range containers {
		if isRunning(container.ContainerID, client) {
			runningContainers = append(runningContainers, container)
		}
	}
	return runningContainers, nil
}

func isRunning(containerID string, client *client.Client) bool {
	containerJSON, errClient := client.ContainerInspect(context.Background(), containerID)
	if errClient != nil {
		return false
	}
	return containerJSON.State.Running
}

func GetContainersId(email string) ([]string, error) {
	rowsDB, errorDB := DB.Query("SELECT containerid FROM terminals WHERE email = $1", email)
	if errorDB != nil {
		return nil, errorDB
	}
	ids := []string{}
	for rowsDB.Next() {
		var containerID string
		if errScan := rowsDB.Scan(&containerID); errScan != nil {
			return nil, errScan
		}
		ids = append(ids, containerID)
	}
	return ids, nil

}
