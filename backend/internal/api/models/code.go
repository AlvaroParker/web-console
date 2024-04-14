package models

import (
	"os"
)

type CodeReq struct {
	Code     *string `json:"code"`
	Language *string `json:"language"`
}

func HandleFIleCreation(content string, user string) (string, error) {
	// Create tmp file
	file, errFile := os.CreateTemp("tmp", user+"_*")
	if errFile != nil {
		return "", errFile
	}

	// This returns only
	fileName := file.Name()

	file.Write([]byte(content))
	if err := file.Close(); err != nil {
		return "", err
	}

	return fileName, nil
}

func CreateContainer(file string, filetype string) (*WebContainer, error) {
	command := "cargo run"
	_ = Container{
		Image:          "rustcustom",
		Tag:            "latest",
		Command:        &command,
		Name:           &file,
		NetworkEnabled: false,
		AutoRemove:     true,
	}

	return nil, nil
}
