package server

import (
	"net/http"
	"time"

	"github.com/AlvaroParker/web-console/internal/api/handlers"
)

func CreateServer() *http.Server {
	s := &http.Server{
		Addr:           ":8080",
		Handler:        nil,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20, // We allow max
	}

	http.HandleFunc("/", handlers.MainHandler)
	http.HandleFunc("/console/ws", handlers.ConsoleHandler)
	return s
}
