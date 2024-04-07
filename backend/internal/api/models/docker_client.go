package models

import (
	"context"
	"encoding/base64"
	"errors"
	"log"
	"net"
	"os"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
	"golang.org/x/term"
)

type ImageType string

const (
	// Suported images
	UbuntuLTS ImageType = "ubuntu:22.04"
	Debian    ImageType = "debian:stable"
)

type WebContainer struct {
	/// The command to run in the container, usually a shell
	Command string
	/// The image to use for the container
	Image      ImageType
	AttachIO   bool
	AutoRemove bool
	Name       *string
	client     *client.Client
	context    context.Context
	id         *string
}

func NewWebContainer() (*WebContainer, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		return nil, err
	}
	return &WebContainer{
		Command:    "/bin/bash",
		Image:      UbuntuLTS,
		AttachIO:   true,
		AutoRemove: true,
		Name:       nil,
		context:    context.Background(),
		client:     cli,
		id:         nil,
	}, nil
}

func (wc *WebContainer) Create() error {
	var containerName string
	if wc.client == nil || wc.context == nil {
		return errors.New("client or context is nil")
	}

	containerConfig := container.Config{
		Image:        string(wc.Image),
		AttachStdin:  wc.AttachIO,
		AttachStderr: wc.AttachIO,
		AttachStdout: wc.AttachIO,
		OpenStdin:    wc.AttachIO,
		Tty:          wc.AttachIO,
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
		return err
	}

	wc.client.ContainerStart(wc.context, container_res.ID, container.StartOptions{})

	id_response, errExecCreate := wc.client.ContainerExecCreate(wc.context, container_res.ID, types.ExecConfig{
		Cmd: []string{wc.Command},
	})
	if errExecCreate != nil {
		wc.client.ContainerRemove(wc.context, container_res.ID, container.RemoveOptions{})
		return errExecCreate
	}

	errExecStart := wc.client.ContainerExecStart(wc.context, id_response.ID, types.ExecStartCheck{})
	if errExecStart != nil {
		wc.client.ContainerRemove(wc.context, container_res.ID, container.RemoveOptions{})
		return errExecStart
	}

	wc.id = &container_res.ID

	return nil
}

func (wc *WebContainer) AttachContainer(resize bool, wsConn *websocket.Conn) error {
	attachOptions := container.AttachOptions{
		Stdin:  true,
		Stdout: true,
		Stderr: true,
		Stream: true,
	}

	resp, errAttach := wc.client.ContainerAttach(wc.context, *wc.id, attachOptions)
	if resize {
		width, height, _ := term.GetSize(int(os.Stdin.Fd()))
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
		log.Println("Error while stopping the container: ", err)
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
