package database

import (
	"database/sql"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB(dbUrl string) error {
	var err error
	DB, err = sql.Open("postgres", dbUrl)
	if err != nil {
		return err
	}
	return nil
}
