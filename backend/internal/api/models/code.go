package models

import (
	"archive/tar"
	"bytes"
	"io"

	"github.com/charmbracelet/log"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
)

type CodeReq struct {
	Code     *string `json:"code"`
	Language *string `json:"language"`
}

/*
Right now executions are not interactive, this can be changed by attach the stdio to the container the same
way we do on console.go
*/
func HandleExecution(code *CodeReq) ([]byte, error) {
	log.Info("[models.HandleExecution] Code: \"", *code.Code, "\" ,Language: \"", *code.Language, "\"")
	switch *code.Language {
	case "rust":
		return HandleGenericExecution(*code.Code, "/usr/local/cargo/bin/cargo run", "customrust", "latest", "/usr/src/app/devcontainer/src", "main.rs")
	case "python":
		return HandleGenericExecution(*code.Code, "python3 /app/main.py", "custompython", "latest", "/app", "main.py")
	case "c":
		return HandleGenericExecution(*code.Code, "./run.sh", "customc", "latest", "/app", "main.c")
	case "cpp":
		return HandleGenericExecution(*code.Code, "./runcpp.sh", "customcpp", "latest", "/app", "main.cpp")
	case "typescript":
		return HandleGenericExecution(*code.Code, "ts-node /app/index.ts", "customts", "latest", "/app", "index.ts")
	case "go":
		return HandleGenericExecution(*code.Code, "go run /app/main.go", "customgo", "latest", "/app", "main.go")
	case "bash":
		return HandleGenericExecution(*code.Code, "bash /app/main.sh", "custombash", "latest", "/app", "main.sh")
	default:
		return nil, nil
	}
}

/*
General process to execute code will be:
1. Create the container with the corresponding language
2. Copy the tmp file into the container (equivalent of doing docker cp <path> <container>:<path>)
3. Start the container
4. Get the out (logs) of the container (equivalent of doing docker logs <container>)
5. Send it back to the client
*/

func HandleGenericExecution(content string, command string, image string, tag string, filepath string, name string) ([]byte, error) {
	containerConfig := Container{
		Image:          image,
		Tag:            tag,
		AutoRemove:     false,
		NetworkEnabled: false,
		Command:        &command,
		Name:           nil,
	}
	wc, errWc := NewWebContainer(containerConfig, nil)
	if errWc != nil {
		return nil, errWc
	}
	id, errCreate := wc.Create()
	defer wc.client.ContainerRemove(wc.context, *id, container.RemoveOptions{Force: true})
	if errCreate != nil {
		return nil, errCreate
	}

	buf, errTar := createTar(content, name)
	if errTar != nil {
		return nil, errTar
	}

	bufLogs, errCpRun := copyAndRun(wc, filepath, buf, id)
	if errCpRun != nil {
		log.Error("[models.HandleGenericExecution] Error while copying and running: ", errCpRun)
		return nil, errCpRun
	}
	return bufLogs, nil
}

func createTar(content string, name string) (*bytes.Buffer, error) {
	var buf bytes.Buffer
	tw := tar.NewWriter(&buf)
	err := tw.WriteHeader(&tar.Header{
		Name: name,
		Mode: 0777,
		Size: int64(len(content)),
	})
	if err != nil {
		return nil, err
	}
	tw.Write([]byte(content))
	tw.Close()
	return &buf, nil
}

func copyAndRun(wc *WebContainer, path string, buf *bytes.Buffer, id *string) ([]byte, error) {
	copyErr := wc.client.CopyToContainer(wc.context, *id, path, buf, types.CopyToContainerOptions{
		AllowOverwriteDirWithFile: false,
	})
	if copyErr != nil {
		return nil, copyErr
	}

	errStart := wc.Start(false)
	if errStart != nil {
		return nil, errStart
	}

	// Get logs
	reader, errLogs := wc.client.ContainerLogs(wc.context, *id, container.LogsOptions{
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
