package models

import (
	"context"
	"encoding/base64"
	"errors"
	"log"
	"net"
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
)

type ImageType string

const (
	// Suported images
	UbuntuLTS ImageType = "ubuntu:22.04"
	Debian    ImageType = "debian:stable"
)

// WebContainer struct to configure attached containers
type WebContainer struct {
	Command       string          // Command to run in the container
	Image         ImageType       // Image to use for the container
	AttachIO      bool            // Attach IO to the container
	AutoRemove    bool            // If we should autoremove when the container stops
	Name          *string         // Optional name for the container
	client        *client.Client  // Docker client
	context       context.Context // Context
	id            *string         // The id of the container, either provided or generated
	networkEnable bool
}

// DefaultWebContainer creates a new WebContainer
func DefaultWebContainer(hash *string) (*WebContainer, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return nil, err
	}
	return &WebContainer{
		Command:       "/bin/bash",
		Image:         UbuntuLTS,
		AttachIO:      true,
		AutoRemove:    false,
		Name:          nil,
		context:       context.Background(),
		client:        cli,
		id:            hash,
		networkEnable: true,
	}, nil
}

func NewWebContainer(containerConf Container, id *string) (*WebContainer, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return nil, err
	}
	// Check if containerConf has empty values or non set
	if containerConf.Image == "" || containerConf.Tag == "" || containerConf.Command == nil {
		return nil, errors.New("Empty values in containerConf")
	}

	return &WebContainer{
		Command:       *containerConf.Command,
		Image:         ImageType(containerConf.Image + ":" + containerConf.Tag),
		AttachIO:      true,
		AutoRemove:    containerConf.AutoRemove,
		Name:          containerConf.Name,
		context:       context.Background(),
		client:        cli,
		id:            id,
		networkEnable: containerConf.NetworkEnabled,
	}, nil
}

func (wc *WebContainer) Start(doexec bool) error {
	_, err := wc.client.ContainerInspect(wc.context, *wc.id)
	// Container exists
	if err == nil {
		wc.client.ContainerStart(wc.context, *wc.id, container.StartOptions{})

		if doexec {
			id_response, errExecCreate := wc.client.ContainerExecCreate(wc.context, *wc.id, types.ExecConfig{
				Cmd: []string{wc.Command},
			})
			if errExecCreate != nil {
				return errExecCreate
			}

			errExecStart := wc.client.ContainerExecStart(wc.context, id_response.ID, types.ExecStartCheck{})
			if errExecStart != nil {
				return errExecStart
			}
		}
		return nil
	}
	log.Println("[WebContainer.Start] Container doesn't exists")
	return err
}

// / Returns the ID of the new container or an error
func (wc *WebContainer) Create() (*string, error) {
	// Check if we have an ID and if the container exists
	if wc.id != nil {
		err := wc.Start(true)
		if err == nil {
			return wc.id, nil
		}
	}

	var containerName string
	if wc.client == nil || wc.context == nil {
		return nil, errors.New("client or context is nil")
	}

	// Split the command by space, first check if the command doesn't start with sh -c
	var cmd []string
	if strings.HasPrefix(wc.Command, "/bin/sh -c") {
		// Split only in 3 parts
		cmd = strings.SplitN(wc.Command, " ", 3)
	} else {
		cmd = strings.Split(wc.Command, " ")
	}

	log.Println("[WebContainer.Create] Command: ", cmd)

	containerConfig := container.Config{
		Image:           string(wc.Image),
		AttachStdin:     wc.AttachIO,
		AttachStderr:    wc.AttachIO,
		AttachStdout:    wc.AttachIO,
		OpenStdin:       wc.AttachIO,
		Tty:             wc.AttachIO,
		NetworkDisabled: !wc.networkEnable,
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

	container_res, err := wc.client.ContainerCreate(wc.context, &containerConfig, &hostConfig, nil, nil, containerName)
	if err != nil {
		return nil, err
	}
	wc.id = &container_res.ID

	return wc.id, nil
}

func (wc *WebContainer) AttachContainer(resize bool, wsConn *websocket.Conn, width int, height int) error {
	attachOptions := container.AttachOptions{
		Stdin:  true,
		Stdout: true,
		Stderr: true,
		Stream: true,
	}

	resp, errAttach := wc.client.ContainerAttach(wc.context, *wc.id, attachOptions)
	if resize {
		wc.client.ContainerResize(wc.context, *wc.id, container.ResizeOptions{
			Height: uint(height),
			Width:  uint(width),
		})
	}

	defer resp.Close()
	if errAttach != nil {
		return errAttach
	}
	go handle_input(resp.Conn, wsConn)
	go handle_output(resp.Conn, wsConn)

	statusCh, errWait := wc.client.ContainerWait(wc.context, *wc.id, container.WaitConditionNotRunning)
	select {
	case err := <-errWait:
		if err != nil {
			return err
		}
	case <-statusCh:
	}
	return nil
}

func (wc *WebContainer) Close() {
	err := wc.client.ContainerStop(wc.context, *wc.id, container.StopOptions{})
	if err != nil {
		log.Println("[WebContainer.Close] Error while stopping the container: ", err)
	}
}

func handle_input(conn net.Conn, wsConn *websocket.Conn) {
	for {
		_, message, err := wsConn.ReadMessage()
		if err != nil {
			break
		}
		conn.Write(message)

	}
}

func handle_output(conn net.Conn, wsOut *websocket.Conn) {
	for {
		buf := make([]byte, 1024)
		n, err := conn.Read(buf)
		if err != nil {
			return
		}
		str_encode := base64.StdEncoding.EncodeToString(buf[:n])
		wsOut.WriteMessage(websocket.TextMessage, []byte(str_encode))
	}
}
