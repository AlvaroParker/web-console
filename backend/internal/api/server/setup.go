package server

import (
	"log"
	"net/http"
	"os"
	"time"

	database "github.com/AlvaroParker/web-console/internal/api"
	"github.com/AlvaroParker/web-console/internal/api/handlers"
	"github.com/joho/godotenv"

	_ "github.com/lib/pq"
)

func CreateServer() *http.Server {
	errDotenv := godotenv.Load()
	if errDotenv != nil {
		panic("Error loading .env file")
	}

	dbUrl := os.Getenv("DATABASE_URL")
	log.Println("Connecting with url ", dbUrl)
	database.InitDB(dbUrl)

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

	http.HandleFunc("/console/ws", handlers.ConsoleHandler)
	http.HandleFunc("/container", handlers.ContainerHandler)
	http.HandleFunc("/container/", handlers.ContainerHandler)

	// http.HandleFunc("/container/new", handlers.NewContainer)
	// http.HandleFunc("/container/get", handlers.ListContainers)
	// http.HandleFunc("/container/delete/", handlers.DeleteContainer)
	return s
}
