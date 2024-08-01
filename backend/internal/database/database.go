package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB(user string, dbName string, sslMode string, password string) error {
	var err error
	connStr := fmt.Sprintf("user=%s dbname=%s sslmode=%s password='%s'", user, dbName, sslMode, password)
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return err
	}
	return nil
}
