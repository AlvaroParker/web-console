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
	ID        int    `json:"id"`
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

type UserRes struct {
	Name              string        `json:"name"`
	Lastname          string        `json:"lastname"`
	Email             string        `json:"email"`
	ActiveContainers  int           `json:"active_containers"`
	RunningContainers []TerminalRes `json:"running_containers"`
}

type PasswordReq struct {
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
	errScan := query.Scan(&session.ID, &session.SessionID, &session.Email)

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

func DeleteSession(sessionCookie string) error {
	_, errDB := database.DB.Exec("DELETE FROM sessions WHERE sessionid = $1", sessionCookie)

	if errDB != nil {
		return errDB
	}
	return nil
}

func GetUserInfoDB(email string) (*UserRes, error) {
	var user UserRes
	row := database.DB.QueryRow("SELECT name, lastname,email FROM users WHERE email = $1", email)
	if errDB := row.Scan(&user.Name, &user.Lastname, &user.Email); errDB != nil {
		return nil, errDB
	}
	count, errDB := CountContainers(email)
	if errDB != nil {
		return nil, errDB
	}
	user.ActiveContainers = count

	runningContainers, errDBRunning := GetRunningContainers(email)
	if errDBRunning != nil {
		return nil, errDBRunning
	}
	user.RunningContainers = runningContainers
	return &user, nil
}

func UpdatePassword(email string, password string) error {
	// Hash the password
	_, err := database.DB.Exec("UPDATE users SET password = $1 WHERE email = $2", password, email)
	if err != nil {
		return err
	}
	return nil
}

func CloseAllSessions(email string) error {
	_, err := database.DB.Exec("DELETE FROM sessions WHERE email = $1", email)
	if err != nil {
		return err
	}
	return nil
}

func ExpireCookie() time.Time {
	// Send beggining of times
	return time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
}
