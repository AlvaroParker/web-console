package models

import (
	"context"

	database "github.com/AlvaroParker/web-console/internal/api"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

type Terminal struct {
	Id          int    `json:"id"`
	ContainerID string `json:"containerid"`
	Email       string `json:"email"`
	Image       string `json:"image"`
	Tag         string `json:"tag"`
}

type TerminalRes struct {
	ContainerID string `json:"containerid"`
	Image       string `json:"image"`
	Tag         string `json:"tag"`
}

type Container struct {
	Image string `json:"image"`
	Tag   string `json:"tag"`
}

func ValidateContainer(email string, hash string) bool {
	var terminal Terminal
	query := database.DB.QueryRow("SELECT * FROM terminals WHERE email = $1 and containerid = $2", email, hash)
	queryErr := query.Scan(&terminal.Id, &terminal.ContainerID, &terminal.Email, &terminal.Image, &terminal.Tag)
	if queryErr != nil {
		return false
	}
	return true
}

func GetTerminals(email string) ([]TerminalRes, error) {
	rowsDB, errorDb := database.DB.Query("SELECT containerid, image,tag FROM terminals WHERE email = $1", email)
	if errorDb != nil {
		return nil, errorDb
	}
	// Convert the rows to a list of `Terminal`
	// var terminals []Terminal
	var terminals []TerminalRes
	for rowsDB.Next() {
		var terminal TerminalRes
		if errScan := rowsDB.Scan(&terminal.ContainerID, &terminal.Image, &terminal.Tag); errScan != nil {
			return nil, errScan
		}

		terminals = append(terminals, terminal)
	}

	return terminals, nil
}

// Add a container ID to the database
func AddContainerDB(email string, containerID string, container Container) error {
	_, err := database.DB.Exec("INSERT INTO terminals (containerid, email, image, tag) VALUES ($1, $2, $3, $4)", containerID, email, container.Image, container.Tag)
	return err
}

func DeleteContainerDB(id string, email string) (bool, error) {
	sqlRes, errDB := database.DB.Exec("DELETE FROM terminals WHERE containerid = $1 and email = $2", id, email)
	if errDB != nil {
		return false, errDB
	}
	rowsAffected, _ := sqlRes.RowsAffected()
	if rowsAffected == 0 {
		return false, nil
	}

	// Delete using docker client
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return false, err
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
