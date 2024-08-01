package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/AlvaroParker/box-code/internal/database"
	"github.com/charmbracelet/log"
	"golang.org/x/crypto/bcrypt"
)

func comparePassword(hashedPassword string, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func LoginHandler(writer http.ResponseWriter, request *http.Request) {
	var user database.UserLogin
	err := json.NewDecoder(request.Body).Decode(&user)
	if err != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	DBUser, errUser := database.SearchUser(user.Email)
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
		cookieVal, errCook := database.GenerateCookie(user.Email)
		if errCook != nil {
			writer.WriteHeader(http.StatusInternalServerError)
			return
		}
		http.SetCookie(writer, cookieVal)
		writer.WriteHeader(http.StatusOK)
	} else {
		writer.WriteHeader(http.StatusUnauthorized)
	}
}

var bcryptCost = 10

func CreateAccount(writer http.ResponseWriter, request *http.Request) {
	var user database.User

	errJSON := json.NewDecoder(request.Body).Decode(&user)
	if errJSON != nil {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	hashedPassword, errHash := bcrypt.GenerateFromPassword([]byte(user.Password), bcryptCost)
	if errHash != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	httpRes := database.CreateUser(user, string(hashedPassword))
	writer.WriteHeader(httpRes)
}

func LogoutHandler(writer http.ResponseWriter, request *http.Request) {
	cookie, err := request.Cookie("session")
	if err != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	if database.DeleteSession(cookie.Value) != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	cookie.Expires = database.ExpireCookie()
	http.SetCookie(writer, cookie)
	writer.WriteHeader(http.StatusOK)
}

func UserInfo(writer http.ResponseWriter, request *http.Request) {
	user, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}
	userDB, errUser := database.GetUserInfoDB(user)
	if errUser != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	jsonRes, errJSON := json.Marshal(userDB)
	if errJSON != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	writer.Header().Set("Content-Type", "application/json")
	writer.Write(jsonRes)
}

func ChangePassword(writer http.ResponseWriter, request *http.Request) {
	user, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Extract password from the request
	var pass database.PasswordReq
	jsonErr := json.NewDecoder(request.Body).Decode(&pass)
	log.Info(pass)
	if jsonErr != nil || pass.Password == "" {
		writer.WriteHeader(http.StatusBadRequest)
		return
	}

	// Updated the password
	hashedPassword, errHash := bcrypt.GenerateFromPassword([]byte(pass.Password), bcryptCost)
	if errHash != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
	dbErr := database.UpdatePassword(user, string(hashedPassword))
	if dbErr != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func CloseSessions(writer http.ResponseWriter, request *http.Request) {
	user, errAuth := database.Middleware(request)
	if errAuth != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	err := database.CloseAllSessions(user)
	if err != nil {
		writer.WriteHeader(http.StatusInternalServerError)
		return
	}

	writer.WriteHeader(http.StatusOK)
}

func AuthUser(writer http.ResponseWriter, request *http.Request) {
	_, err := database.Middleware(request)
	if err != nil {
		writer.WriteHeader(http.StatusUnauthorized)
		return
	}

	writer.WriteHeader(http.StatusOK)
}
