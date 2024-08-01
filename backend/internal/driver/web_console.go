package driver

import (
	"bytes"
	"context"
	"encoding/base64"
	"errors"
	"io"
	"net"
	"strings"

	"github.com/charmbracelet/log"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
)

var dockerClient *client.Client

// Init the docker client, must be call on server initialization
func InitClient() {
	cli, error := client.NewClientWithOpts(client.FromEnv)
	if error != nil {
		panic(error.Error())
	}
	dockerClient = cli
}

type ImageType string

// A container instance
type WebContainer struct {
	Command       string    // Command to run in the container
	Image         ImageType // Image to use for the container
	AttachIO      bool      // Attach IO to the container
	AutoRemove    bool      // If we should autoremove when the container stops
	Name          *string   // Optional name for the container
	Id            *string   // The id of the container, either provided or generated
	NetworkEnable bool
}

// Create the container and return the id
func (wc *WebContainer) Create(ctx context.Context) (*string, error) {
	// Check if we have an ID and if the container exists
	if wc.Id != nil {
		return wc.Id, nil
	}

	var containerName string
	// Split the command by space, first check if the command doesn't start with sh -c
	var cmd []string
	if strings.HasPrefix(wc.Command, "/bin/sh -c") {
		cmd = strings.SplitN(wc.Command, " ", 3)
	} else {
		cmd = strings.Split(wc.Command, " ")
	}

	log.Info("[WebContainer.Create]", "command", cmd)

	containerConfig := container.Config{
		Image:           string(wc.Image),
		AttachStdin:     wc.AttachIO,
		AttachStderr:    wc.AttachIO,
		AttachStdout:    wc.AttachIO,
		OpenStdin:       wc.AttachIO,
		Tty:             wc.AttachIO,
		NetworkDisabled: !wc.NetworkEnable,
		Cmd:             cmd,
	}

	hostConfig := container.HostConfig{
		AutoRemove: wc.AutoRemove,
	}
	if wc.Name != nil {
		containerName = *wc.Name
	} else {
		containerName = ""
	}

	containerRes, err := dockerClient.ContainerCreate(ctx, &containerConfig, &hostConfig, nil, nil, containerName)
	if err != nil {
		return nil, err
	}
	wc.Id = &containerRes.ID

	return wc.Id, nil
}

// Start the container
func (wc *WebContainer) Start(ctx context.Context) error {
	if wc.Id == nil {
		return errors.New("Web container id not defined")
	}
	_, err := dockerClient.ContainerInspect(ctx, *wc.Id)
	// Container exists
	if err == nil {
		if err := dockerClient.ContainerStart(ctx, *wc.Id, container.StartOptions{}); err != nil {
			log.Info("[WebContainer.Start] Error while starting the container", "error", err)
			return err
		}

		return nil
	}
	log.Info("[WebContainer.Start] Container doesn't exists", "error", err)
	return err
}

// Close the container
func (wc *WebContainer) Close(ctx context.Context) error {
	if wc.Id == nil {
		return errors.New("Id of container is nil")
	}
	err := dockerClient.ContainerStop(ctx, *wc.Id, container.StopOptions{})
	if err != nil {
		log.Info("[WebContainer.Close] Error while stopping the container", "error", err)
		return err
	}
	return nil
}

// Attachs the websocket streams to the container io streams of the main running process (configured on container creation)
func (wc *WebContainer) AttachContainer(ctx context.Context, resize bool, wsConn *websocket.Conn, logs bool, width int, height int) error {
	attachOptions := container.AttachOptions{
		Stdin:  true,
		Stdout: true,
		Stderr: true,
		Stream: true,
		Logs:   logs,
	}

	resp, errAttach := dockerClient.ContainerAttach(ctx, *wc.Id, attachOptions)
	defer resp.Close()
	if resize {
		dockerClient.ContainerResize(ctx, *wc.Id, container.ResizeOptions{
			Height: uint(height),
			Width:  uint(width),
		})
	}

	if errAttach != nil {
		return errAttach
	}
	go handleInput(resp.Conn, wsConn)
	go handleOutput(resp.Conn, wsConn)

	// Wait for container to stop
	statusCh, errWait := dockerClient.ContainerWait(ctx, *wc.Id, container.WaitConditionNotRunning)
	select {
	case err := <-errWait:
		if err != nil {
			return err
		}
	case <-statusCh:
	}
	return nil
}

func handleInput(conn net.Conn, wsConn *websocket.Conn) {
	for {
		_, message, err := wsConn.ReadMessage()
		if err != nil {
			break
		}
		conn.Write(message)
	}
}

func handleOutput(conn net.Conn, wsOut *websocket.Conn) {
	for {
		buf := make([]byte, 1024)
		n, err := conn.Read(buf)
		if err != nil {
			return
		}
		strEncode := base64.StdEncoding.EncodeToString(buf[:n])
		wsOut.WriteMessage(websocket.TextMessage, []byte(strEncode))
	}
}

// Remove the given container
func (w *WebContainer) RemoveContainer(ctx context.Context) {
	if w.Id != nil {
		dockerClient.ContainerRemove(ctx, *w.Id, container.RemoveOptions{Force: true})
	}
}

// Copy a file to the given container and start the container. Finally get container logs.
func (wc *WebContainer) CopyFileAndStart(ctx context.Context, path string, buf *bytes.Buffer) ([]byte, error) {
	if wc.Id == nil {
		return nil, errors.New("Container id is nil")
	}
	copyErr := dockerClient.CopyToContainer(ctx, *wc.Id, path, buf, container.CopyToContainerOptions{
		AllowOverwriteDirWithFile: false,
	})
	if copyErr != nil {
		return nil, copyErr
	}

	errStart := wc.Start(ctx)
	if errStart != nil {
		return nil, errStart
	}

	// Get logs
	reader, errLogs := dockerClient.ContainerLogs(ctx, *wc.Id, container.LogsOptions{
		Follow:     true, // Follow idk why this is needed
		ShowStdout: true,
		ShowStderr: true,
	})
	if errLogs != nil {
		return nil, errLogs
	}

	// Read to buff
	bufLogs, errRead := io.ReadAll(reader)
	if errRead != nil {
		return nil, errRead
	}
	return bufLogs, nil
}
