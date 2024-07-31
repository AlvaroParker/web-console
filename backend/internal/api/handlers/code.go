package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/AlvaroParker/web-console/internal/api/models"
	"github.com/charmbracelet/log"
)

func PostCodeHandler(writer http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	_, errAuth := models.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	var codeReq models.CodeReq
	jsonErr := json.NewDecoder(request.Body).Decode(&codeReq)
	if jsonErr != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	if codeReq.Code == nil || codeReq.Language == nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	output, errExec := models.HandleExecution(&codeReq)
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
