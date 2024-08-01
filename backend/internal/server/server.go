package server

import (
	"net/http"
	"os"
	"time"

	"github.com/AlvaroParker/box-code/internal/database"
	"github.com/AlvaroParker/box-code/internal/driver"
	"github.com/AlvaroParker/box-code/internal/server/handlers"
	"github.com/charmbracelet/log"
	"github.com/joho/godotenv"
)

func CreateServer() *http.Server {
	err := godotenv.Load()
	if err != nil {
		log.Error("Error while loading env files", "error", err)
	}

	s := &http.Server{
		Addr:           ":8080",
		Handler:        nil,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20, // We allow max
	}

	user := os.Getenv("PG_USER")
	db_name := os.Getenv("PG_DB")
	sslmode := os.Getenv("PG_SSLMODE")
	password := os.Getenv("PG_PASSWORD")
	database.InitDB(user, db_name, sslmode, password)
	driver.InitClient()

	// Enable CORS origin any
	http.HandleFunc("OPTIONS /", enableCors)

	http.Handle("POST /login", middleware(handlers.LoginHandler))
	http.Handle("POST /signin", middleware(handlers.CreateAccount))
	http.Handle("GET /auth", middleware(handlers.AuthUser))
	http.Handle("POST /logout", middleware(handlers.LogoutHandler))
	http.Handle("GET /user/info", middleware(handlers.UserInfo))
	http.Handle("POST /user/password", middleware(handlers.ChangePassword))
	http.Handle("GET /user/close-sessions", middleware(handlers.CloseSessions))

	http.Handle("GET /console/ws", middleware(handlers.ConsoleHandler))
	http.Handle("GET /container/resize", middleware(handlers.HandleResize))
	http.Handle("DELETE /container/{containerID}", middleware(handlers.DeleteContainer))
	http.Handle("POST /containers/fullstop", middleware(handlers.HandleFullStop))
	http.Handle("GET /container/info", middleware(handlers.InfoContainer))
	http.Handle("POST /container", middleware(handlers.NewContainer))
	http.Handle("GET /container", middleware(handlers.ListContainers))
	http.Handle("GET /images", middleware(handlers.GetImages))
	http.Handle("POST /code", middleware(handlers.PostCodeHandler))

	return s
}

func enableCors(w http.ResponseWriter, r *http.Request) {
	log.Info(r)
	(w).Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
	(w).Header().Set("Access-Control-Allow-Credentials", "true")
	(w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
	(w).Header().Set("Access-Control-Allow-Methods", "GET,POST,DELETE")
}

func middleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		(w).Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
		(w).Header().Set("Access-Control-Allow-Credentials", "true")
		(w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
		next.ServeHTTP(w, r)
	})
}
