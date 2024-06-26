package server

import (
	"net/http"
	"os"
	"time"

	database "github.com/AlvaroParker/web-console/internal/api"
	"github.com/AlvaroParker/web-console/internal/api/handlers"
	"github.com/charmbracelet/log"
	"github.com/joho/godotenv"

	_ "github.com/lib/pq"
)

func CreateServer() *http.Server {
	errDotenv := godotenv.Load()
	if errDotenv != nil {
		panic("Error loading .env file")
	}

	dbURL := os.Getenv("DATABASE_URL")
	log.Debug("Connecting with url ", dbURL)
	database.InitDB(dbURL)

	s := &http.Server{
		Addr:           ":8080",
		Handler:        nil,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20, // We allow max
	}

	http.HandleFunc("/", handlers.MainHandler)
	http.HandleFunc("/login", handlers.LoginHandler)
	http.HandleFunc("/signin", handlers.CreateAccount)
	http.HandleFunc("/auth", handlers.AuthUser)
	http.HandleFunc("/logout", handlers.LogoutHandler)
	http.HandleFunc("/user/info", handlers.UserInfo)
	http.HandleFunc("/user/password", handlers.ChangePassword)
	http.HandleFunc("/user/close-sessions", handlers.CloseSessions)

	http.HandleFunc("/console/ws", handlers.ConsoleHandler)
	http.HandleFunc("/container/resize", handlers.HandleResize)
	http.HandleFunc("/container", handlers.ContainerHandler)
	http.HandleFunc("/container/", handlers.ContainerHandler)
	http.HandleFunc("/container/info", handlers.InfoContainer)
	http.HandleFunc("/containers/fullstop", handlers.HandleFullStop)

	http.HandleFunc("/images", handlers.GetImages)

	http.HandleFunc("/code", handlers.PostCodeHandler)

	return s
}
