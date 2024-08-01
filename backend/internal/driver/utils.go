package driver

import (
	"context"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

func DeleteContainer(ctx context.Context, id string) error {
	if err := dockerClient.ContainerStop(context.Background(), id, container.StopOptions{}); err != nil {
		return err
	}
	return nil
}

func IsRunning(containerID string, client *client.Client) bool {
	containerJSON, errClient := client.ContainerInspect(context.Background(), containerID)
	if errClient != nil {
		return false
	}
	return containerJSON.State.Running
}

func ContainerResize(height uint, width uint, id string) error {
	client, errClient := client.NewClientWithOpts(client.FromEnv)
	if errClient != nil {
		return errClient
	}
	if IsRunning(id, client) {
		err := client.ContainerResize(context.Background(), id, container.ResizeOptions{
			Height: height,
			Width:  width,
		})
		if err != nil {
			return err
		}
	}
	return nil
}
