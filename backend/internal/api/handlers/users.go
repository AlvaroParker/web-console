package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/AlvaroParker/web-console/internal/api/models"

	"golang.org/x/crypto/bcrypt"
)

func comparePassword(hashedPassword string, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func LoginHandler(writer http.ResponseWriter, request *http.Request) {
	// CORS
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
	var user models.UserLogin
	err := json.NewDecoder(request.Body).Decode(&user)
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	DBUser, errUser := models.SearchUser(user.Email)
	switch errUser {
	case sql.ErrNoRows:
		writer.WriteHeader(http.StatusUnauthorized)
		return
	case nil:
		break
	default:
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	matchPassword := comparePassword(DBUser.Password, user.Password)
	if matchPassword {
		cookie_val, errCook := models.GenerateCookie(user.Email)
		if errCook != nil {
			writer.WriteHeader(http.StatusInternalServerError)
			return
		}
		http.SetCookie(writer, cookie_val)
		writer.WriteHeader(http.StatusOK)
	} else {
		writer.WriteHeader(http.StatusUnauthorized)
	}
}

var bcryptCost = 10

func CreateAccount(writer http.ResponseWriter, request *http.Request) {
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
	var user models.User

	errJson := json.NewDecoder(request.Body).Decode(&user)
	if errJson != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	hashedPassword, errHash := bcrypt.GenerateFromPassword([]byte(user.Password), bcryptCost)
	if errHash != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	httpRes := models.CreateUser(user, string(hashedPassword))
	writer.WriteHeader(httpRes)
}

func LogoutHandler(writer http.ResponseWriter, request *http.Request) {
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

	cookie, err := request.Cookie("session")
	if err != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	if models.DeleteSession(cookie.Value) != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	cookie.Expires = models.ExpireCookie()
	http.SetCookie(writer, cookie)
	writer.WriteHeader(http.StatusOK)
	return
}

func AuthUser(writer http.ResponseWriter, request *http.Request) {
	models.CorsHeaders(writer, request)
	if request.Method == http.MethodOptions {
		writer.Header().Set("Access-Control-Allow-Methods", "POST")
		writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		writer.WriteHeader(http.StatusOK)
		return
	}
	_, err := models.Middleware(request)
	if err != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	writer.WriteHeader(http.StatusOK)
	return
}
