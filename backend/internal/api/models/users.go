package models

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"time"

	database "github.com/AlvaroParker/web-console/internal/api"
	"github.com/lib/pq"
)

type Session struct {
	Id        int    `json:"id"`
	SessionID string `json:"sessionid"`
	Email     string `json:"email"`
}

type UserLogin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type User struct {
	Name     string `json:"name"`
	Lastname string `json:"lastname"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Middleware(request *http.Request) (string, error) {
	cookie, err := request.Cookie("session")
	if err != nil {
		return "", err
	}

	session, err := CheckValidSession(cookie.Value)
	if err != nil {
		return "", err
	}
	return session.Email, nil
}

func CheckValidSession(sessionID string) (*Session, error) {
	query := database.DB.QueryRow("SELECT * FROM sessions WHERE sessionid = $1", sessionID)

	var session Session
	errScan := query.Scan(&session.Id, &session.SessionID, &session.Email)

	if errScan != nil {
		return nil, errScan
	}

	return &session, nil
}

func SearchUser(email string) (*User, error) {
	var DBUser User
	row := database.DB.QueryRow("SELECT * FROM users WHERE email = $1", email)
	errDB := row.Scan(&DBUser.Name, &DBUser.Lastname, &DBUser.Email, &DBUser.Password)
	if errDB != nil {
		return nil, errDB
	}

	return &DBUser, nil
}

func CreateUser(user User, hashedPassword string) int {
	_, errDB := database.DB.Exec("INSERT INTO users (name, lastname, email, password) VALUES ($1, $2, $3, $4)", user.Name, user.Lastname, user.Email, string(hashedPassword))
	// Convert to pq error to check if the user already exists
	if errDB, ok := errDB.(*pq.Error); ok {
		if errDB.Code == "23505" {
			return http.StatusConflict
		}
	}
	if errDB != nil {
		return http.StatusInternalServerError
	}

	return http.StatusCreated
}

func GenerateCookie(email string) (*http.Cookie, error) {
	cookieLength := 48
	randomBytes := make([]byte, cookieLength)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return nil, err
	}

	// Encode random bytes into a base64 string
	randomCookie := base64.URLEncoding.EncodeToString(randomBytes)
	cookie := &http.Cookie{
		Name:     "session",
		Value:    randomCookie,
		HttpOnly: false,
		Secure:   true,
		Expires:  time.Now().Add(24 * time.Hour),
		SameSite: http.SameSiteNoneMode,
	}
	_, errDB := database.DB.Exec("INSERT INTO sessions (sessionid, email) VALUES ($1, $2)", randomCookie, email)
	if errDB != nil {
		return nil, errDB
	}

	return cookie, nil
}

func CorsHeaders(writer http.ResponseWriter, request *http.Request) {
	writer.Header().Set("Access-Control-Allow-Origin", request.Header.Get("Origin"))
	writer.Header().Set("Access-Control-Allow-Credentials", "true")
}
