package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/AlvaroParker/web-console/internal/api/models"
)

func PostCodeHandler(writer http.ResponseWriter, request *http.Request) {
	models.CorsHeaders(writer, request)
	if request.Method == http.MethodOptions {
		writer.Header().Set("Access-Control-Allow-Methods", "POST")
		writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		writer.WriteHeader(http.StatusOK)
		return
	}

	if request.Method != http.MethodPost {
		writer.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	user, errAuth := models.Middleware(request)
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

	log.Println("{code: \"" + *codeReq.Code + "\", language: \"" + *codeReq.Language + "\"}")

	path, errCreation := models.HandleFIleCreation(*codeReq.Code, user)
	if errCreation != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	log.Println("File created at ", path)

	writer.WriteHeader(http.StatusOK)
}
