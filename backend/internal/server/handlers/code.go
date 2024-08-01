package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/AlvaroParker/web-console/internal/database"
	"github.com/AlvaroParker/web-console/internal/driver"
	"github.com/charmbracelet/log"
)

func PostCodeHandler(writer http.ResponseWriter, request *http.Request) {
	_, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	ctx := context.Background()

	var codeReq driver.CodeReq
	jsonErr := json.NewDecoder(request.Body).Decode(&codeReq)
	if jsonErr != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	if codeReq.Code == nil || codeReq.Language == nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	output, errExec := driver.HandleExecution(ctx, &codeReq)
	if errExec != nil {
		log.Error("[handlers.PostCodeHandler] Error while executing the code: ", errExec)
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	if len(output) == 0 {
		log.Warn("[handlers.PostCodeHandler] Empty output")
	}
	writer.Write(output)
	writer.WriteHeader(http.StatusOK)
}
