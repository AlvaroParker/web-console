package models

import (
	"archive/tar"
	"bytes"
	"io"
	"log"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
)

type CodeReq struct {
	Code     *string `json:"code"`
	Language *string `json:"language"`
}

func HandleExecution(code *CodeReq) ([]byte, error) {
	switch *code.Language {
	case "rust":
		log.Println("[models.HandleExecution] Rust code detected")
		return HandleGenericExecution(*code.Code, "/usr/local/cargo/bin/cargo run", "customrust", "latest", "/usr/src/app/devcontainer/src", "main.rs")
	case "python":
		log.Println("[models.HandleExecution] Python code detected")
		return HandleGenericExecution(*code.Code, "python3 /app/main.py", "custompython", "latest", "/app", "main.py")
	case "c":
		log.Println("[models.HandleExecution] C code detected")
		return HandleGenericExecution(*code.Code, "./run.sh", "customc", "latest", "/app", "main.c")
	case "cpp":
		log.Println("[models.HandleExecution] C++ code detected")
		return HandleGenericExecution(*code.Code, "./runcpp.sh", "customcpp", "latest", "/app", "main.cpp") // ?? not working
	case "typescript":
		log.Println("[models.HandleExecution] TypeScript code detected")
		return HandleGenericExecution(*code.Code, "ts-node /app/index.ts", "customts", "latest", "/app", "index.ts")
	case "go":
		log.Println("[models.HandleExecution] Go code detected")
		return HandleGenericExecution(*code.Code, "go run /app/main.go", "customgo", "latest", "/app", "main.go")
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
		log.Println("[models.HandleGenericExecution] Error while creating the WebContainer: ", errWc)
		return nil, errWc
	}
	id, errCreate := wc.Create()
	defer wc.client.ContainerRemove(wc.context, *id, container.RemoveOptions{Force: true})
	if errCreate != nil {
		log.Println("[models.HandleGenericExecution] Error while creating the container: ", errCreate)
		return nil, errCreate
	}

	buf, errTar := createTar(content, name)
	if errTar != nil {
		log.Println("[models.HandleGenericExecution] Error while creating the tar: ", errTar)
		return nil, errTar
	}

	bufLogs, errCpRun := copyAndRun(wc, filepath, buf, id)
	if errCpRun != nil {
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
		log.Println("[models.copyAndRun] Error while copying the file to the container: ", copyErr)
		return nil, copyErr
	}

	errStart := wc.Start(false)
	if errStart != nil {
		log.Println("[models.copyAndRun] Error while starting the container: ", errStart)
		return nil, errStart
	}

	// Get logs
	reader, errLogs := wc.client.ContainerLogs(wc.context, *id, container.LogsOptions{
		Follow:     true, // Follow idk why this is needed
		ShowStdout: true,
		ShowStderr: true,
	})
	if errLogs != nil {
		log.Println("[models.copyAndRun] Error while getting the logs: ", errLogs)
		return nil, errLogs
	}

	// Read to buff
	bufLogs, errRead := io.ReadAll(reader)
	if errRead != nil {
		log.Println("[models.copyAndRun] Error while reading the logs: ", errRead)
		return nil, errRead
	}
	return bufLogs, nil
}
