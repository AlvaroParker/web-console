package driver

import (
	"archive/tar"
	"bytes"
	"context"

	"github.com/charmbracelet/log"
)

type CodeReq struct {
	Code     *string `json:"code"`
	Language *string `json:"language"`
}

/*
Right now executions are not interactive, this can be changed by attach the stdio to the container the same
way we do on console.go
*/
func HandleExecution(ctx context.Context, code *CodeReq) ([]byte, error) {
	log.Info("[models.HandleExecution] Code: \"", *code.Code, "\" ,Language: \"", *code.Language, "\"")
	switch *code.Language {
	case "rust":
		return HandleGenericExecution(ctx, *code.Code, "/usr/local/cargo/bin/cargo run", "customrust", "latest", "/usr/src/app/devcontainer/src", "main.rs")
	case "python":
		return HandleGenericExecution(ctx, *code.Code, "python3 /app/main.py", "custompython", "latest", "/app", "main.py")
	case "c":
		return HandleGenericExecution(ctx, *code.Code, "./run.sh", "customc", "latest", "/app", "main.c")
	case "cpp":
		return HandleGenericExecution(ctx, *code.Code, "./runcpp.sh", "customcpp", "latest", "/app", "main.cpp")
	case "typescript":
		return HandleGenericExecution(ctx, *code.Code, "ts-node /app/index.ts", "customts", "latest", "/app", "index.ts")
	case "go":
		return HandleGenericExecution(ctx, *code.Code, "go run /app/main.go", "customgo", "latest", "/app", "main.go")
	case "bash":
		return HandleGenericExecution(ctx, *code.Code, "bash /app/main.sh", "custombash", "latest", "/app", "main.sh")
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

func HandleGenericExecution(ctx context.Context, content string, command string, image string, tag string, filepath string, name string) ([]byte, error) {
	wc := &WebContainer{
		Command:       command,
		Image:         ImageType(image + ":" + tag),
		AttachIO:      true,
		AutoRemove:    false,
		Name:          nil,
		Id:            nil,
		NetworkEnable: false,
	}
	_, errCreate := wc.Create(ctx)
	defer wc.RemoveContainer(ctx)
	if errCreate != nil {
		return nil, errCreate
	}

	buf, errTar := createTar(content, name)
	if errTar != nil {
		return nil, errTar
	}

	bufLogs, errCpRun := wc.CopyFileAndStart(ctx, filepath, buf)
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
